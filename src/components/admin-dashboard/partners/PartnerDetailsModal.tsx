import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Partner } from "@/types/user";

interface PartnerDetailsModalProps {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
  statusColors: Record<string, string>;
}

const PartnerDetailsModal = ({ partner, isOpen, onClose, statusColors }: PartnerDetailsModalProps) => {
  const { actualTheme } = useTheme();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className={cn(
            actualTheme === 'dark' ? "text-white" : "text-gray-900"
          )}>Partner Details - {partner.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          {/* Basic Info */}
          <div className={cn(
            "p-4 border rounded-lg",
            actualTheme === 'dark' ? "border-slate-700" : "border-gray-200"
          )}>
            <h3 className={cn(
              "font-semibold mb-2",
              actualTheme === 'dark' ? "text-white" : "text-gray-900"
            )}>Organization Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={cn(
                  "text-sm",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Name</label>
                <p className={cn(
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>{partner.name}</p>
              </div>
              <div>
                <label className={cn(
                  "text-sm",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Email</label>
                <p className={cn(
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>{partner.email}</p>
              </div>
              <div>
                <label className={cn(
                  "text-sm",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Type</label>
                <p className={cn(
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>{partner.type}</p>
              </div>
              <div>
                <label className={cn(
                  "text-sm",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Location</label>
                <p className={cn(
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>{partner.location}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className={cn(
            "p-4 border rounded-lg",
            actualTheme === 'dark' ? "border-slate-700" : "border-gray-200"
          )}>
            <h3 className={cn(
              "font-semibold mb-2",
              actualTheme === 'dark' ? "text-white" : "text-gray-900"
            )}>Status</h3>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-sm ${statusColors[partner.status]}`}>
              {partner.status}
            </span>
          </div>

          {/* Description */}
          <div className={cn(
            "p-4 border rounded-lg",
            actualTheme === 'dark' ? "border-slate-700" : "border-gray-200"
          )}>
            <h3 className={cn(
              "font-semibold mb-2",
              actualTheme === 'dark' ? "text-white" : "text-gray-900"
            )}>Description</h3>
            <p className={cn(
              actualTheme === 'dark' ? "text-slate-300" : "text-gray-600"
            )}>{partner.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerDetailsModal;