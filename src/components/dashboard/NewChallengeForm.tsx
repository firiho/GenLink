import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const NewChallengeForm = ({ challenge, setChallenge, onSubmit, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Challenge</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Add form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewChallengeForm;