import { LucideIcon } from 'lucide-react';
import { formatCompactCurrency, DEFAULT_CURRENCY } from '@/lib/currency';

/**
 * Represents a stat value with current and previous values
 * Used for calculating change percentage across all dashboards
 */
export interface StatValue {
  value: number;
  prev: number;
}

/**
 * Represents an array-based stat value for idempotent tracking
 * The value is derived from the array length
 */
export interface ArrayStatValue {
  activeTeamIds?: string[]; // For team tracking
  activeChallengeIds?: string[]; // For active challenges tracking
  submissionIds?: string[]; // For submissions tracking
  participantIds?: string[]; // For participant tracking (partner stats)
  prev: number;
}

/**
 * Parsed stat with calculated change information
 */
export interface ParsedStat {
  label: string;
  value: string;
  change: number; // Percentage change
  changeText: string;
  isPositive: boolean;
  icon: LucideIcon;
  color: string;
  bg: string;
  onClick?: () => void;
}

/**
 * Prize pool stat with idempotent tracking
 */
export interface PrizePoolStatValue {
  value: number;
  prev: number;
  prizeAddedChallengeIds?: string[]; // Track which challenges' prizes have been counted
}

/**
 * Raw stat data from Firestore for Partner Dashboard
 * Stored in stats/org_{orgId} document
 */
export interface PartnerStats {
  activeChallenges?: StatValue | ArrayStatValue; // Active challenges (idempotent with activeChallengeIds)
  totalParticipants?: StatValue | ArrayStatValue; // Participants across all challenges (idempotent with participantIds)
  totalPrizePool?: PrizePoolStatValue; // Total prize money (idempotent with prizeAddedChallengeIds)
  completionRate?: StatValue;
  // Add more as needed
}

/**
 * Raw stat data from Firestore for Participant Dashboard
 * Stored in user profiles document
 */
export interface ParticipantStats {
  activeChallenges?: StatValue | ArrayStatValue; // Challenges in progress (idempotent with activeChallengeIds)
  activeTeams?: StatValue | ArrayStatValue; // Teams user is in (idempotent with activeTeamIds)
  totalSubmissions?: StatValue | ArrayStatValue; // Submissions made (idempotent with submissionIds)
  successRate?: StatValue;
  // Add more as needed
}

/**
 * Raw stat data from Firestore for Landing Page
 * Stored in stats/public document
 */
export interface PublicStats {
  challenges?: StatValue;
  developers?: StatValue;
  prizes?: StatValue;
  // Add more as needed
}

/**
 * Helper function to calculate percentage change between current and previous values
 */
export function calculateChange(current: number, previous: number): { change: number; isPositive: boolean } {
  if (previous === 0) {
    return { change: current > 0 ? 100 : 0, isPositive: current >= 0 };
  }
  
  const change = ((current - previous) / previous) * 100;
  return { 
    change: Math.round(change), 
    isPositive: change >= 0 
  };
}

/**
 * Helper function to format a StatValue into display properties
 * Supports both value-based and array-based stat formats
 */
export function parseStatValue(
  statValue: StatValue | ArrayStatValue | undefined,
  defaultValue: number = 0
): { value: number; change: number; isPositive: boolean; changeText: string } {
  let value: number;
  let prev: number;
  
  if (!statValue) {
    value = defaultValue;
    prev = defaultValue;
  } else if ('activeTeamIds' in statValue && Array.isArray(statValue.activeTeamIds)) {
    // Array-based stat for teams (idempotent)
    value = statValue.activeTeamIds.length;
    prev = statValue.prev ?? defaultValue;
  } else if ('activeChallengeIds' in statValue && Array.isArray(statValue.activeChallengeIds)) {
    // Array-based stat for active challenges (idempotent)
    value = statValue.activeChallengeIds.length;
    prev = statValue.prev ?? defaultValue;
  } else if ('submissionIds' in statValue && Array.isArray(statValue.submissionIds)) {
    // Array-based stat for submissions (idempotent)
    value = statValue.submissionIds.length;
    prev = statValue.prev ?? defaultValue;
  } else if ('participantIds' in statValue && Array.isArray(statValue.participantIds)) {
    // Array-based stat for participants (idempotent - partner stats)
    value = statValue.participantIds.length;
    prev = statValue.prev ?? defaultValue;
  } else {
    // Standard value-based stat
    value = (statValue as StatValue).value ?? defaultValue;
    prev = (statValue as StatValue).prev ?? defaultValue;
  }
  
  const { change, isPositive } = calculateChange(value, prev);
  
  const changeText = `${isPositive ? '+' : ''}${change}% this month`;
  
  return { value, change, isPositive, changeText };
}

/**
 * Format a number for display (e.g., 2400 -> "2.4k")
 */
export function formatStatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
}

/**
 * Format a currency value for display (compact).
 * Delegates to the centralized currency module.
 */
export function formatStatCurrency(value: number, currency: string = DEFAULT_CURRENCY): string {
  return formatCompactCurrency(value, currency);
}

/**
 * Format a percentage value for display
 */
export function formatStatPercentage(value: number): string {
  return `${value}%`;
}
