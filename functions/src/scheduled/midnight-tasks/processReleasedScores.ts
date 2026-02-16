/**
 * Process Released Scores
 * 
 * This task checks all challenges in 'judging' status that have had their scores released.
 * When scores have been released by the partner:
 * 1. The challenge status is updated to 'completed'
 * 2. Winners are credited with prize money in their wallets
 * 3. All participants are notified of the results
 * 4. Winner badges/achievements are recorded
 * 
 * This ensures prizes are distributed and participants are notified after judging.
 */

import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";
import { MidnightTask } from "./types";
import { addNotification } from "../../notifications";

const db = admin.firestore();

interface WinnerData {
  submissionId: string;
  participantName?: string;
  participantId?: string;
  participantType?: string;
  teamId?: string;
  projectTitle: string;
  score: number | null;
  prize: number;
  awardName?: string; // For special awards
}

interface ChallengeAwards {
  first: WinnerData | null;
  second: WinnerData | null;
  third: WinnerData | null;
  specialAwards: WinnerData[];
}

/**
 * Credit prize money to a wallet
 * Creates the wallet if it doesn't exist
 */
async function creditWallet(
  ownerId: string,
  ownerType: "user" | "team",
  amount: number,
  challengeId: string,
  challengeTitle: string,
  awardType: string
): Promise<void> {
  if (amount <= 0) return;

  const walletId = ownerType === "team" ? `team_${ownerId}` : ownerId;
  const walletRef = db.collection("wallets").doc(walletId);

  const transactionData = {
    id: `${challengeId}_${awardType}_${Date.now()}`,
    type: "credit",
    amount,
    description: `Prize: ${awardType} place - ${challengeTitle}`,
    challengeId,
    challengeTitle,
    awardType,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.runTransaction(async (transaction) => {
    const walletDoc = await transaction.get(walletRef);

    if (walletDoc.exists) {
      const currentBalance = walletDoc.data()?.balance || 0;
      const currentTransactions = walletDoc.data()?.transactions || [];

      transaction.update(walletRef, {
        balance: currentBalance + amount,
        transactions: [transactionData, ...currentTransactions.slice(0, 99)], // Keep last 100 transactions
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      transaction.set(walletRef, {
        ownerId,
        ownerType,
        balance: amount,
        currency: "USD",
        transactions: [transactionData],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

  logger.info(`Credited $${amount} to wallet ${walletId}`, { challengeId, awardType });
}

/**
 * Send notification to a winner
 */
async function notifyWinner(
  userId: string,
  challengeTitle: string,
  challengeId: string,
  awardType: string,
  prize: number,
  projectTitle: string
): Promise<void> {
  const ordinalMap: Record<string, string> = {
    first: "1st",
    second: "2nd",
    third: "3rd"
  };

  const isSpecialAward = !["first", "second", "third"].includes(awardType);
  const placement = ordinalMap[awardType] || awardType;

  await addNotification(userId, {
    type: "achievement",
    title: isSpecialAward ? "🏆 Special Award Winner!" : `🏆 ${placement} Place Winner!`,
    message: isSpecialAward
      ? `Congratulations! Your project "${projectTitle}" won the ${awardType} award in "${challengeTitle}"! You've been awarded $${prize}.`
      : `Congratulations! Your project "${projectTitle}" won ${placement} place in "${challengeTitle}"! You've been awarded $${prize}.`,
    link: `/dashboard/challenges/${challengeId}`,
    metadata: { challengeId, challengeTitle, awardType, prize, projectTitle }
  });
}

/**
 * Send notification to non-winner participants
 */
async function notifyParticipant(
  userId: string,
  challengeTitle: string,
  challengeId: string
): Promise<void> {
  await addNotification(userId, {
    type: "info",
    title: "Challenge Results Announced",
    message: `The results for "${challengeTitle}" have been announced. Check out the winners and see how you ranked!`,
    link: `/challenge/${challengeId}`,
    metadata: { challengeId, challengeTitle }
  });
}

/**
 * Get all team member user IDs
 */
async function getTeamMemberIds(teamId: string): Promise<string[]> {
  const membersSnapshot = await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .where("status", "==", "active")
    .get();

  return membersSnapshot.docs.map((doc) => doc.data().userId).filter(Boolean);
}

/**
 * Process a single winner (place or special award)
 */
async function processWinner(
  winner: WinnerData,
  challengeId: string,
  challengeTitle: string,
  awardType: string,
  processedUserIds: Set<string>
): Promise<void> {
  const prize = winner.prize || 0;

  // Determine if it's a team or individual
  if (winner.teamId) {
    // Credit team wallet
    await creditWallet(winner.teamId, "team", prize, challengeId, challengeTitle, awardType);

    // Notify all team members
    const memberIds = await getTeamMemberIds(winner.teamId);
    for (const memberId of memberIds) {
      await notifyWinner(memberId, challengeTitle, challengeId, awardType, prize, winner.projectTitle);
      processedUserIds.add(memberId);
    }
  } else if (winner.participantId) {
    // Credit individual wallet
    await creditWallet(winner.participantId, "user", prize, challengeId, challengeTitle, awardType);

    // Notify the winner
    await notifyWinner(winner.participantId, challengeTitle, challengeId, awardType, prize, winner.projectTitle);
    processedUserIds.add(winner.participantId);
  }
}

/**
 * Process a single challenge with released scores
 */
async function processReleasedChallenge(
  challengeDoc: admin.firestore.DocumentSnapshot
): Promise<{
  challengeId: string;
  winnersProcessed: number;
  participantsNotified: number;
  totalPrizeDistributed: number;
}> {
  const challengeId = challengeDoc.id;
  const challengeData = challengeDoc.data()!;
  const challengeTitle = challengeData.title || "Challenge";
  const awards = challengeData.awards as ChallengeAwards;

  logger.info(`Processing released scores for: ${challengeTitle}`, { challengeId });

  const processedUserIds = new Set<string>();
  let winnersProcessed = 0;
  let totalPrizeDistributed = 0;

  // Process 1st, 2nd, 3rd place winners
  const placements: Array<{ key: keyof Omit<ChallengeAwards, "specialAwards">; type: string }> = [
    { key: "first", type: "first" },
    { key: "second", type: "second" },
    { key: "third", type: "third" }
  ];

  for (const placement of placements) {
    const winner = awards[placement.key];
    if (winner) {
      try {
        await processWinner(winner, challengeId, challengeTitle, placement.type, processedUserIds);
        winnersProcessed++;
        totalPrizeDistributed += winner.prize || 0;
      } catch (error) {
        logger.error(`Failed to process ${placement.type} place winner`, { challengeId, error });
      }
    }
  }

  // Process special awards
  if (awards.specialAwards && Array.isArray(awards.specialAwards)) {
    for (const specialAward of awards.specialAwards) {
      if (specialAward) {
        try {
          const awardName = specialAward.awardName || "Special Award";
          await processWinner(specialAward, challengeId, challengeTitle, awardName, processedUserIds);
          winnersProcessed++;
          totalPrizeDistributed += specialAward.prize || 0;
        } catch (error) {
          logger.error("Failed to process special award winner", { challengeId, error });
        }
      }
    }
  }

  // Notify all other participants who submitted
  const submissionsSnapshot = await db
    .collection("submissions")
    .where("challengeId", "==", challengeId)
    .where("status", "==", "submitted")
    .get();

  let participantsNotified = 0;

  for (const submissionDoc of submissionsSnapshot.docs) {
    const submissionData = submissionDoc.data();

    // For team submissions, notify all team members
    if (submissionData.teamId) {
      const memberIds = await getTeamMemberIds(submissionData.teamId);
      for (const memberId of memberIds) {
        if (!processedUserIds.has(memberId)) {
          try {
            await notifyParticipant(memberId, challengeTitle, challengeId);
            processedUserIds.add(memberId);
            participantsNotified++;
          } catch (error) {
            logger.error(`Failed to notify participant ${memberId}`, { error });
          }
        }
      }
    } else if (submissionData.participantId && !processedUserIds.has(submissionData.participantId)) {
      try {
        await notifyParticipant(submissionData.participantId, challengeTitle, challengeId);
        processedUserIds.add(submissionData.participantId);
        participantsNotified++;
      } catch (error) {
        logger.error(`Failed to notify participant ${submissionData.participantId}`, { error });
      }
    }
  }

  // Update challenge status to 'completed'
  await challengeDoc.ref.update({
    status: "completed",
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
    completedReason: "scores_released",
    prizeDistributionCompleted: true,
    prizeDistributionStats: {
      winnersProcessed,
      participantsNotified,
      totalPrizeDistributed,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  });

  // Remove from org's active challenges
  if (challengeData.organizationId) {
    const orgStatsRef = db.collection("stats").doc(`org_${challengeData.organizationId}`);
    await orgStatsRef.set(
      {
        "activeChallenges.activeChallengeIds": admin.firestore.FieldValue.arrayRemove(challengeId)
      },
      { merge: true }
    );
  }

  return { challengeId, winnersProcessed, participantsNotified, totalPrizeDistributed };
}

/**
 * The task implementation
 */
async function run(): Promise<void> {
  logger.info("Checking for challenges with released scores...");

  // Find all judging challenges where scores have been released
  const judgingChallengesSnapshot = await db
    .collection("challenges")
    .where("status", "==", "judging")
    .where("scoresReleased", "==", true)
    .get();

  logger.info(`Found ${judgingChallengesSnapshot.size} challenges with released scores to process`);

  let processedCount = 0;
  let totalWinners = 0;
  let totalParticipants = 0;
  let totalPrize = 0;
  const processedChallenges: string[] = [];

  for (const challengeDoc of judgingChallengesSnapshot.docs) {
    try {
      const result = await processReleasedChallenge(challengeDoc);
      processedCount++;
      totalWinners += result.winnersProcessed;
      totalParticipants += result.participantsNotified;
      totalPrize += result.totalPrizeDistributed;
      processedChallenges.push(result.challengeId);
    } catch (error) {
      logger.error(`Failed to process released scores for challenge ${challengeDoc.id}`, { error });
    }
  }

  logger.info("Released scores processing complete", {
    challengesProcessed: processedCount,
    totalWinners,
    totalParticipantsNotified: totalParticipants,
    totalPrizeDistributed: totalPrize,
    challengeIds: processedChallenges
  });
}

export const processReleasedScoresTask: MidnightTask = {
  name: "processReleasedScores",
  description: "Processes challenges with released scores, distributes prizes to wallets, and sends notifications to all participants",
  enabled: true,
  run
};
