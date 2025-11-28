import { CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const BillingSettings = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">Billing Information</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-2 text-slate-900 dark:text-white">Current Plan</p>
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900">Enterprise</Badge>
                <p className="text-slate-900 dark:text-white font-semibold">$499/month</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Unlimited challenges, priority support, and advanced analytics
              </p>
            </div>
          </div>

          <div>
            <p className="font-medium mb-2 text-slate-900 dark:text-white">Payment Method</p>
            <div className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
              <CreditCard className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">•••• •••• •••• 4242</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Expires 12/24</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-medium text-slate-900 dark:text-white">Billing History</p>
          <div className="space-y-2">
            {[
              {
                date: 'Mar 1, 2024',
                amount: '$499.00',
                status: 'Paid'
              },
              {
                date: 'Feb 1, 2024',
                amount: '$499.00',
                status: 'Paid'
              }
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{invoice.date}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.amount}</p>
                </div>
                <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400">
                  {invoice.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
