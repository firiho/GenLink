/**
 * Midnight Task Types
 */

/**
 * Interface for a midnight task
 */
export interface MidnightTask {
  /** Unique name for the task */
  name: string;
  
  /** Human-readable description of what the task does */
  description: string;
  
  /** Whether the task is enabled (set to false to temporarily disable) */
  enabled: boolean;
  
  /** The function to run - should be async and handle its own errors */
  run: () => Promise<void>;
}

/**
 * Result of running a task
 */
export interface TaskResult {
  taskName: string;
  success: boolean;
  duration: number;
  error?: string;
}
