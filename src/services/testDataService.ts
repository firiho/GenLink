/**
 * Test Data Service
 * 
 * Centralized service for generating, deleting, and tracking test data.
 * Calls the 'testing' Cloud Function.
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";

export interface GenerateTestDataRequest {
  participants: number;
  partners: number;
  challenges: number;
  teams: number;
  projects: number;
  events: number;
}

export interface GenerationResults {
  users: number;
  profiles: number;
  organizations: number;
  challenges: number;
  teams: number;
  projects: number;
  events: number;
}

export interface GenerateTestDataResponse {
  success: boolean;
  message: string;
  results: GenerationResults;
}

export interface DeleteTestDataResponse {
  success: boolean;
  message: string;
  deleted: Record<string, number>;
}

export interface TestDataStats {
  participants: number;
  partners: number;
  challenges: number;
  teams: number;
  projects: number;
  events: number;
}

export interface StatsResponse {
  success: boolean;
  stats: TestDataStats;
}

/**
 * Generates test data by calling the Cloud Function
 */
export const generateTestData = async (
  counts: GenerateTestDataRequest
): Promise<GenerateTestDataResponse> => {
  const testingFn = httpsCallable(functions, "testing");
  const result = await testingFn({
    action: "generate",
    counts: counts,
  });
  return result.data as GenerateTestDataResponse;
};

/**
 * Deletes all test data by calling the Cloud Function
 */
export const deleteAllTestData = async (): Promise<DeleteTestDataResponse> => {
  const testingFn = httpsCallable(functions, "testing");
  const result = await testingFn({
    action: "delete",
  });
  return result.data as DeleteTestDataResponse;
};

/**
 * Gets current stats of test data from the database
 */
export const getTestDataStats = async (): Promise<TestDataStats> => {
  const testingFn = httpsCallable(functions, "testing");
  const result = await testingFn({
    action: "stats",
  });
  const data = result.data as StatsResponse;
  return data.stats;
};
