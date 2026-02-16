/**
 * Wallet Service
 * 
 * Handles wallet data fetching for users and teams.
 * Wallets are created by the processReleasedScores cloud function when prizes are distributed.
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Wallet, WalletTransaction, WalletSummary } from '@/types/wallet';
import { formatCurrency, formatCompactCurrency, DEFAULT_CURRENCY } from '@/lib/currency';

// Re-export from centralized currency module so existing imports keep working
export { formatCurrency, formatCompactCurrency };

/**
 * Get wallet for a user
 */
export async function getUserWallet(userId: string): Promise<Wallet | null> {
  try {
    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);
    
    if (!walletSnap.exists()) {
      return null;
    }
    
    const data = walletSnap.data();
    return {
      ownerId: data.ownerId,
      ownerType: data.ownerType,
      balance: data.balance || 0,
      currency: data.currency || DEFAULT_CURRENCY,
      transactions: (data.transactions || []).map((t: any) => ({
        ...t,
        createdAt: t.createdAt?.toDate?.() || t.createdAt
      })),
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
    } as Wallet;
  } catch (error) {
    console.error('Error fetching user wallet:', error);
    return null;
  }
}

/**
 * Get wallet for a team
 */
export async function getTeamWallet(teamId: string): Promise<Wallet | null> {
  try {
    const walletRef = doc(db, 'wallets', `team_${teamId}`);
    const walletSnap = await getDoc(walletRef);
    
    if (!walletSnap.exists()) {
      return null;
    }
    
    const data = walletSnap.data();
    return {
      ownerId: data.ownerId,
      ownerType: data.ownerType,
      balance: data.balance || 0,
      currency: data.currency || DEFAULT_CURRENCY,
      transactions: (data.transactions || []).map((t: any) => ({
        ...t,
        createdAt: t.createdAt?.toDate?.() || t.createdAt
      })),
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
    } as Wallet;
  } catch (error) {
    console.error('Error fetching team wallet:', error);
    return null;
  }
}

/**
 * Get user's team IDs from subcollection
 */
export async function getUserTeamIds(userId: string): Promise<string[]> {
  try {
    const teamsRef = collection(db, 'users', userId, 'teams');
    const teamsSnap = await getDocs(teamsRef);
    
    return teamsSnap.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error fetching user team IDs:', error);
    return [];
  }
}

/**
 * Get all wallets accessible to a user (personal + team wallets)
 */
export async function getAllUserWallets(userId: string): Promise<{
  personal: Wallet | null;
  teams: { teamId: string; teamName?: string; wallet: Wallet }[];
}> {
  try {
    // Get personal wallet
    const personal = await getUserWallet(userId);
    
    // Get user's team IDs
    const teamIds = await getUserTeamIds(userId);
    
    // Get team wallets
    const teamWallets: { teamId: string; teamName?: string; wallet: Wallet }[] = [];
    
    for (const teamId of teamIds) {
      const wallet = await getTeamWallet(teamId);
      if (wallet) {
        // Try to get team name
        let teamName: string | undefined;
        try {
          const teamDoc = await getDoc(doc(db, 'teams', teamId));
          if (teamDoc.exists()) {
            teamName = teamDoc.data().name;
          }
        } catch (e) {
          // Skip if can't fetch team name
        }
        
        teamWallets.push({ teamId, teamName, wallet });
      }
    }
    
    return { personal, teams: teamWallets };
  } catch (error) {
    console.error('Error fetching all user wallets:', error);
    return { personal: null, teams: [] };
  }
}

/**
 * Calculate wallet summary
 */
export function calculateWalletSummary(wallet: Wallet): WalletSummary {
  const transactions = wallet.transactions || [];
  
  const totalEarned = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalWithdrawn = transactions
    .filter(t => t.type === 'withdrawal' || t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    balance: wallet.balance,
    totalEarned,
    totalWithdrawn,
    recentTransactions: transactions.slice(0, 10)
  };
}

/**
 * Format transaction date
 */
export function formatTransactionDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Check if user has any wallets (personal or team)
 * This is a lightweight check that just verifies existence without fetching full data
 */
export async function checkUserHasWallet(userId: string): Promise<boolean> {
  try {
    // Check personal wallet first
    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);
    
    if (walletSnap.exists()) {
      return true;
    }
    
    // Check team wallets
    const teamIds = await getUserTeamIds(userId);
    
    for (const teamId of teamIds) {
      const teamWalletRef = doc(db, 'wallets', `team_${teamId}`);
      const teamWalletSnap = await getDoc(teamWalletRef);
      if (teamWalletSnap.exists()) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking user wallet:', error);
    return false;
  }
}
