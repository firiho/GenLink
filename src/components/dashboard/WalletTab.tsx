import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Trophy, Clock, DollarSign, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { getAllUserWallets, formatCurrency, formatTransactionDate, calculateWalletSummary } from '@/services/walletService';
import { Wallet, WalletTransaction } from '@/types/wallet';
import { cn } from '@/lib/utils';
import WithdrawModal from './WithdrawModal';

interface WalletTabProps {
  user: any;
}

export default function WalletTab({ user }: WalletTabProps) {
  const [loading, setLoading] = useState(true);
  const [personalWallet, setPersonalWallet] = useState<Wallet | null>(null);
  const [teamWallets, setTeamWallets] = useState<{ teamId: string; teamName?: string; wallet: Wallet }[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<'personal' | string>('personal');
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        const { personal, teams } = await getAllUserWallets(user.uid);
        setPersonalWallet(personal);
        setTeamWallets(teams);
        
        // If no personal wallet but has team wallets, select first team wallet
        if (!personal && teams.length > 0) {
          setSelectedWallet(teams[0].teamId);
        }
      } catch (error) {
        console.error('Error fetching wallets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [user?.uid]);

  const currentWallet = selectedWallet === 'personal' 
    ? personalWallet 
    : teamWallets.find(t => t.teamId === selectedWallet)?.wallet || null;

  const currentWalletName = selectedWallet === 'personal'
    ? 'Personal'
    : teamWallets.find(t => t.teamId === selectedWallet)?.teamName || 'Team Wallet';

  const summary = currentWallet ? calculateWalletSummary(currentWallet) : null;
  
  const hasMultipleWallets = (personalWallet ? 1 : 0) + teamWallets.length > 1;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />;
      case 'withdrawal':
      case 'debit':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'withdrawal':
      case 'debit':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <WelcomeSection title="Wallet" subtitle="Manage your earnings and withdrawals" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // No wallets state
  if (!personalWallet && teamWallets.length === 0) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <WelcomeSection title="Wallet" subtitle="Manage your earnings and withdrawals" />
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 sm:p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <WalletIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No Wallet Yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Your wallet will be created automatically when you win a challenge. 
            Keep participating in challenges to earn prizes!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <WelcomeSection title="Wallet" subtitle="Manage your earnings and withdrawals" />

      {/* Wallet Selector (if multiple wallets) */}
      {hasMultipleWallets && (
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowWalletSelector(!showWalletSelector)}
            className="w-full sm:w-auto justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-2">
              {selectedWallet === 'personal' ? (
                <WalletIcon className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              <span>{currentWalletName}</span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 ml-2 transition-transform",
              showWalletSelector && "rotate-180"
            )} />
          </Button>
          
          {showWalletSelector && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden">
              {personalWallet && (
                <button
                  onClick={() => {
                    setSelectedWallet('personal');
                    setShowWalletSelector(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                    selectedWallet === 'personal' && "bg-slate-50 dark:bg-slate-800"
                  )}
                >
                  <WalletIcon className="h-4 w-4 text-slate-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Personal</p>
                    <p className="text-xs text-slate-500">{formatCurrency(personalWallet.balance, personalWallet.currency)}</p>
                  </div>
                </button>
              )}
              {teamWallets.map((tw) => (
                <button
                  key={tw.teamId}
                  onClick={() => {
                    setSelectedWallet(tw.teamId);
                    setShowWalletSelector(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                    selectedWallet === tw.teamId && "bg-slate-50 dark:bg-slate-800"
                  )}
                >
                  <Users className="h-4 w-4 text-slate-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{tw.teamName || 'Team'}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(tw.wallet.balance, tw.wallet.currency)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current Balance */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <WalletIcon className="h-5 w-5" />
            </div>
            {selectedWallet !== 'personal' && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Team</span>
            )}
          </div>
          <p className="text-emerald-100 text-sm mb-1">Current Balance</p>
          <p className="text-2xl sm:text-3xl font-bold">
            {summary ? formatCurrency(summary.balance, currentWallet?.currency) : '$0.00'}
          </p>
        </div>

        {/* Total Earned */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Trophy className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Earned</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {summary ? formatCurrency(summary.totalEarned, currentWallet?.currency) : '$0.00'}
          </p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <ArrowUpRight className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Withdrawn</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {summary ? formatCurrency(summary.totalWithdrawn, currentWallet?.currency) : '$0.00'}
          </p>
        </div>
      </div>

      {/* Withdraw Button */}
      {summary && summary.balance > 0 && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowWithdrawModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Withdraw Funds
          </Button>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Transaction History</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your recent wallet activity</p>
            </div>
          </div>
        </div>

        {summary && summary.recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {summary.recentTransactions.map((transaction, index) => (
              <div
                key={transaction.id || index}
                className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    transaction.type === 'credit' 
                      ? "bg-emerald-100 dark:bg-emerald-900/30" 
                      : "bg-red-100 dark:bg-red-900/30"
                  )}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTransactionDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "text-sm sm:text-base font-semibold shrink-0 ml-3",
                  getTransactionColor(transaction.type)
                )}>
                  {transaction.type === 'credit' ? '+' : '-'}
                  {formatCurrency(transaction.amount, currentWallet?.currency)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={summary?.balance || 0}
        currency={currentWallet?.currency || 'USD'}
        walletType={selectedWallet === 'personal' ? 'personal' : 'team'}
        walletName={currentWalletName}
      />
    </div>
  );
}
