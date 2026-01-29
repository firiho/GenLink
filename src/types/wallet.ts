/**
 * Wallet Types
 * 
 * Wallets store prize money for users and teams.
 * Wallet document ID format:
 * - For users: userId (e.g., "abc123")
 * - For teams: "team_{teamId}" (e.g., "team_xyz789")
 */

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'withdrawal';
  amount: number;
  description: string;
  challengeId?: string;
  challengeTitle?: string;
  awardType?: string;
  createdAt: Date | string;
}

export interface Wallet {
  ownerId: string;
  ownerType: 'user' | 'team';
  balance: number;
  currency: string; // e.g., "USD"
  transactions: WalletTransaction[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface WalletSummary {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  recentTransactions: WalletTransaction[];
}
