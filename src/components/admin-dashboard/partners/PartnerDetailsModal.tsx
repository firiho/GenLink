import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Partner } from "@/types/user";

interface PartnerDetailsModalProps {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
  statusColors: Record<string, string>;
}

const PartnerDetailsModal = ({ partner, isOpen, onClose, statusColors }: PartnerDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Partner Details - {partner.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          {/* Basic Info */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Organization Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p>{partner.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p>{partner.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Type</label>
                <p>{partner.type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Location</label>
                <p>{partner.location}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Status</h3>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-sm ${statusColors[partner.status]}`}>
              {partner.status}
            </span>
          </div>

          {/* Description */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{partner.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerDetailsModal;