/**
 * Task Template
 * 
 * Copy this file to create a new midnight task.
 * 
 * INSTRUCTIONS:
 * 1. Copy this file and rename it (e.g., `myNewTask.ts`)
 * 2. Update the name, description, and run function
 * 3. Import and add to the tasks array in `index.ts`
 */

import { logger } from "firebase-functions/v2";
import { MidnightTask } from "./types";

/**
 * The task implementation
 * 
 * Guidelines:
 * - Make it idempotent (safe to run multiple times)
 * - Handle errors gracefully
 * - Log progress for debugging
 * - Keep it reasonably fast (< 5 minutes)
 */
async function run(): Promise<void> {
  logger.info("Starting example task...");
  
  // Your task logic here
  // Example:
  // const db = admin.firestore();
  // const docs = await db.collection("something").get();
  // for (const doc of docs.docs) {
  //   await processDocument(doc);
  // }
  
  logger.info("Example task completed");
}

export const exampleTask: MidnightTask = {
  name: "exampleTask",
  description: "A template task - copy this to create new tasks",
  enabled: false, // Set to true when ready to use
  run
};
