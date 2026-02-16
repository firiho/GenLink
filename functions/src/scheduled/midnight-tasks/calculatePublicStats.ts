/**
 * Calculate Public Stats
 * 
 * This task calculates aggregate statistics for the public landing page.
 * It counts total challenges, developers, and total prize money distributed.
 * 
 * Stats are stored in stats/public document.
 */

import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";
import { MidnightTask } from "./types";
import { convertToUSD } from "../../config";

const db = admin.firestore();

/**
 * Calculate all public-facing statistics
 */
async function calculatePublicStats(): Promise<{
  challenges: number;
  developers: number;
  prizes: number;
}> {
  // Count active/completed challenges (public visibility)
  const challengesSnapshot = await db
    .collection("challenges")
    .where("visibility", "==", "public")
    .where("status", "in", ["active", "completed"])
    .count()
    .get();
  const totalChallenges = challengesSnapshot.data().count;

  // Count participant users
  const participantsSnapshot = await db
    .collection("users")
    .where("user_type", "==", "participant")
    .count()
    .get();
  const totalDevelopers = participantsSnapshot.data().count;

  // Calculate total prize money from completed challenges
  const completedChallengesSnapshot = await db
    .collection("challenges")
    .where("status", "==", "completed")
    .get();
  
  let totalPrizes = 0;
  for (const doc of completedChallengesSnapshot.docs) {
    const data = doc.data();
    const prize = data.total_prize || 0;
    totalPrizes += convertToUSD(prize, data.currency);
  }

  return {
    challenges: totalChallenges,
    developers: totalDevelopers,
    prizes: totalPrizes
  };
}

/**
 * The task implementation
 */
async function run(): Promise<void> {
  logger.info("Calculating public stats...");

  const stats = await calculatePublicStats();

  // Get current stats to preserve prev values
  const publicStatsRef = db.collection("stats").doc("public");
  const currentStats = await publicStatsRef.get();
  const currentData = currentStats.data() || {};

  // Update stats with new values, keeping prev for comparison
  await publicStatsRef.set({
    challenges: {
      value: stats.challenges,
      prev: currentData.challenges?.value || 0
    },
    developers: {
      value: stats.developers,
      prev: currentData.developers?.value || 0
    },
    prizes: {
      value: stats.prizes,
      prev: currentData.prizes?.value || 0
    },
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  logger.info("Public stats updated", {
    challenges: stats.challenges,
    developers: stats.developers,
    prizes: stats.prizes
  });
}

export const calculatePublicStatsTask: MidnightTask = {
  name: "calculatePublicStats",
  description: "Calculates aggregate statistics for the public landing page (challenges, developers, prizes)",
  enabled: true,
  run
};
