import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewChallengeFormProps {
  newChallenge: any;
  setNewChallenge: (challenge: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const NewChallengeForm = ({ 
  newChallenge, 
  setNewChallenge, 
  onSubmit, 
  onCancel 
}: NewChallengeFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={newChallenge.title}
              onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
              placeholder="Enter challenge title"
              required
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-gray-200 p-2"
              value={newChallenge.description}
              onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
              placeholder="Describe your challenge"
              required
            />
          </div>
          
          {/* Other left column fields */}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <Input
              type="date"
              value={newChallenge.deadline}
              onChange={(e) => setNewChallenge({ ...newChallenge, deadline: e.target.value })}
              required
            />
          </div>
          
          {/* Other right column fields */}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div>
        <label className="block text-sm font-medium mb-1">Terms and Conditions</label>
        <textarea
          className="w-full min-h-[100px] rounded-md border border-gray-200 p-2"
          value={newChallenge.termsAndConditions}
          onChange={(e) => setNewChallenge({ ...newChallenge, termsAndConditions: e.target.value })}
          placeholder="Enter terms and conditions"
          required
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-primary text-white">
          Create Challenge
        </Button>
      </div>
    </form>
  );
}; 