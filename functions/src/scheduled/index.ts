/**
 * Scheduled Functions
 * 
 * This module contains scheduled Cloud Functions that run on a cron schedule.
 */

import { onSchedule, ScheduledEvent } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";

// Import all midnight tasks
import { runAllTasks } from "./midnight-tasks";

/**
 * Midnight Run - Scheduled function that runs at midnight Rwanda time (CAT, UTC+2)
 * 
 * Cron: "0 22 * * *" = Every day at 22:00 UTC = 00:00 Rwanda time (UTC+2)
 * 
 * To add new tasks:
 * 1. Create a new file in the `midnight-tasks` folder
 * 2. Export a MidnightTask object with name, description, enabled, and run function
 * 3. Import and add it to the tasks array in `midnight-tasks/index.ts`
 */
export const midnightRun = onSchedule(
  {
    schedule: "0 22 * * *", // 22:00 UTC = 00:00 Rwanda time (UTC+2)
    timeZone: "Africa/Kigali", // Rwanda timezone for clarity
    retryCount: 3, // Retry up to 3 times on failure
  },
  async (event: ScheduledEvent) => {
    const startTime = Date.now();
    logger.info("🌙 Midnight Run started", { 
      scheduledTime: event.scheduleTime,
      timezone: "Africa/Kigali (UTC+2)"
    });

    try {
      const results = await runAllTasks();
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      logger.info("🌙 Midnight Run completed", {
        duration: `${Date.now() - startTime}ms`,
        totalTasks: results.length,
        successful: successCount,
        failed: failCount,
        results: results.map(r => ({
          task: r.taskName,
          success: r.success,
          error: r.error || null
        }))
      });

      if (failCount > 0) {
        logger.warn("⚠️ Some midnight tasks failed", {
          failedTasks: results.filter(r => !r.success).map(r => r.taskName)
        });
      }

    } catch (error) {
      logger.error("❌ Midnight Run failed catastrophically", { error });
      throw error; // Rethrow to trigger retry
    }
  }
);
