/**
 * Midnight Tasks Runner
 * 
 * This module manages all tasks that run during the midnight scheduled function.
 * 
 * HOW TO ADD A NEW TASK:
 * 1. Create a new file in this folder (e.g., `myNewTask.ts`)
 * 2. Export a MidnightTask object from that file
 * 3. Import it below and add it to the `tasks` array
 * 
 * Each task should be:
 * - Idempotent (safe to run multiple times)
 * - Independent (doesn't depend on other tasks)
 * - Fast (should complete within a few minutes)
 */

import { logger } from "firebase-functions/v2";
import { MidnightTask, TaskResult } from "./types";

// Import tasks here
import { updateStatsPrevValues } from "./updateStatsPrevValues";
import { calculatePublicStatsTask } from "./calculatePublicStats";
import { processDeadlinesTask } from "./processDeadlines";
import { sendRemindersTask } from "./sendReminders";
// import { cleanupExpiredData } from "./cleanupExpiredData";
// import { sendDailyDigests } from "./sendDailyDigests";

/**
 * Array of all midnight tasks
 * Add new tasks to this array after importing them
 * Note: sendRemindersTask runs first, then processDeadlinesTask completes challenges, then stats are updated
 */
const tasks: MidnightTask[] = [
  sendRemindersTask,
  processDeadlinesTask,
  updateStatsPrevValues,
  calculatePublicStatsTask,
  // cleanupExpiredData,
  // sendDailyDigests,
];

/**
 * Run all enabled midnight tasks
 * Tasks are run sequentially to avoid overwhelming the database
 */
export async function runAllTasks(): Promise<TaskResult[]> {
  const results: TaskResult[] = [];
  
  const enabledTasks = tasks.filter(task => task.enabled);
  
  logger.info(`Running ${enabledTasks.length} of ${tasks.length} midnight tasks`);

  for (const task of enabledTasks) {
    const taskStart = Date.now();
    
    try {
      logger.info(`▶️ Starting task: ${task.name}`, { 
        description: task.description 
      });
      
      await task.run();
      
      results.push({
        taskName: task.name,
        success: true,
        duration: Date.now() - taskStart
      });
      
      logger.info(`✅ Task completed: ${task.name}`, { 
        duration: `${Date.now() - taskStart}ms` 
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      results.push({
        taskName: task.name,
        success: false,
        duration: Date.now() - taskStart,
        error: errorMessage
      });
      
      logger.error(`❌ Task failed: ${task.name}`, { 
        error: errorMessage,
        duration: `${Date.now() - taskStart}ms`
      });
      
      // Continue with other tasks even if one fails
    }
  }

  return results;
}
