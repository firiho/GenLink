import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const ProfileDropdown = ({ user, onSignOut }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div className="relative">
        <Button 
          variant="ghost" 
          size="sm"
          className="rounded-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {user?.fullName?.[0] || 'A'}
            </span>
          </div>
        </Button>
  
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-40">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    );
};


export default ProfileDropdown;