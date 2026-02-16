import { useState } from 'react';
import { Phone, Building, AlertCircle, ArrowUpRight, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/services/walletService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  currency: string;
  walletType: 'personal' | 'team';
  walletName: string;
}

type PaymentMethod = 'mtn' | 'bank';

export default function WithdrawModal({
  open,
  onClose,
  balance,
  currency,
  walletType,
  walletName
}: WithdrawModalProps) {
  const [step, setStep] = useState<'method' | 'details' | 'confirm'>('method');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    // Reset state
    setStep('method');
    setPaymentMethod(null);
    setAmount('');
    setPhoneNumber('');
    setLoading(false);
    onClose();
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    const amountNum = parseFloat(amount);
    
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amountNum > balance) {
      toast.error('Amount exceeds your balance');
      return;
    }

    if (paymentMethod === 'mtn' && !phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    
    // Simulate API call - this is a placeholder
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.info('Withdrawal request submitted! This feature is coming soon.', {
      description: 'We are working on integrating payment methods. Your request has been noted.'
    });
    
    setLoading(false);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Withdraw from {walletName} • Available: {formatCurrency(balance, currency)}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Select Payment Method */}
        {step === 'method' && (
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select your preferred withdrawal method:
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleMethodSelect('mtn')}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  "hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/10",
                  "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Phone className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">MTN Mobile Money</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Instant transfer to your MTN MoMo account
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('bank')}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10",
                  "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Bank Transfer</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Transfer to your bank account (1-3 business days)
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Coming Soon:</strong> Payment integrations are being finalized. 
                Withdrawal requests will be processed manually until then.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Enter Details */}
        {step === 'details' && (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Withdrawal Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  max={balance}
                  step="0.01"
                />
              </div>
              <p className="text-xs text-slate-500">
                Maximum: {formatCurrency(balance, currency)}
              </p>
            </div>

            {paymentMethod === 'mtn' && (
              <div className="space-y-2">
                <Label>MTN Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="+250 78X XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Enter the MTN number registered with MoMo
                </p>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Bank transfer details will be requested after submission. 
                  Our team will contact you to complete the transfer.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep('method')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleDetailsSubmit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Method</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {paymentMethod === 'mtn' ? 'MTN Mobile Money' : 'Bank Transfer'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatCurrency(parseFloat(amount) || 0, currency)}
                </span>
              </div>
              {paymentMethod === 'mtn' && phoneNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {phoneNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">From</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {walletName}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                By confirming, you agree to our withdrawal terms. Processing time varies by method.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep('details')}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Withdrawal'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
