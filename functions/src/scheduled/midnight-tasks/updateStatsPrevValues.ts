/**
 * Update Stats Prev Values
 * 
 * This task updates the `prev` field in all stats documents to enable
 * month-over-month change calculations. It should run at the start of
 * each month, but runs daily to ensure data consistency.
 * 
 * For array-based stats, prev = current array length
 * For value-based stats, prev = current value
 */

import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";
import { MidnightTask } from "./types";

const db = admin.firestore();

/**
 * Check if today is the first day of the month
 */
function isFirstDayOfMonth(): boolean {
  const now = new Date();
  // Adjust for Rwanda time (UTC+2)
  const rwandaTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  return rwandaTime.getDate() === 1;
}

/**
 * Update prev values for a stats document
 */
async function updateStatsDocPrevValues(docRef: admin.firestore.DocumentReference): Promise<void> {
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return;
  }

  const data = doc.data()!;
  const updates: Record<string, any> = {};

  // Process each stat field
  for (const [key, statValue] of Object.entries(data)) {
    if (typeof statValue !== "object" || statValue === null) {
      continue;
    }

    // Handle array-based stats (activeChallengeIds, activeTeamIds, etc.)
    if ("activeChallengeIds" in statValue && Array.isArray(statValue.activeChallengeIds)) {
      updates[`${key}.prev`] = statValue.activeChallengeIds.length;
    } else if ("activeTeamIds" in statValue && Array.isArray(statValue.activeTeamIds)) {
      updates[`${key}.prev`] = statValue.activeTeamIds.length;
    } else if ("submissionIds" in statValue && Array.isArray(statValue.submissionIds)) {
      updates[`${key}.prev`] = statValue.submissionIds.length;
    } else if ("participantIds" in statValue && Array.isArray(statValue.participantIds)) {
      updates[`${key}.prev`] = statValue.participantIds.length;
    } else if ("prizeAddedChallengeIds" in statValue && "value" in statValue) {
      // Prize pool - use value
      updates[`${key}.prev`] = statValue.value || 0;
    } else if ("value" in statValue && typeof statValue.value === "number") {
      // Standard value-based stat
      updates[`${key}.prev`] = statValue.value;
    }
  }

  if (Object.keys(updates).length > 0) {
    await docRef.update(updates);
    logger.info(`Updated prev values for ${docRef.path}`, { 
      fieldsUpdated: Object.keys(updates).length 
    });
  }
}

/**
 * The task implementation
 */
async function run(): Promise<void> {
  // Only update prev values on the first day of the month
  if (!isFirstDayOfMonth()) {
    logger.info("Skipping prev value update - not first day of month");
    return;
  }

  logger.info("Updating prev values for all stats documents (monthly rollover)");

  // Get all stats documents
  const statsSnapshot = await db.collection("stats").get();
  
  let updatedCount = 0;
  let errorCount = 0;

  for (const doc of statsSnapshot.docs) {
    try {
      await updateStatsDocPrevValues(doc.ref);
      updatedCount++;
    } catch (error) {
      logger.error(`Failed to update ${doc.ref.path}`, { error });
      errorCount++;
    }
  }

  logger.info("Prev values update complete", {
    totalDocs: statsSnapshot.size,
    updated: updatedCount,
    errors: errorCount
  });
}

export const updateStatsPrevValues: MidnightTask = {
  name: "updateStatsPrevValues",
  description: "Updates the 'prev' field in stats documents for month-over-month comparisons (runs on 1st of month)",
  enabled: true,
  run
};
