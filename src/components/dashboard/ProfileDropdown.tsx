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
          className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-200 font-semibold text-sm">
              {user?.firstName?.[0] || 'A'}
            </span>
          </div>
        </Button>
  
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-40">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                <p className="font-medium truncate text-slate-900 dark:text-white">{user?.firstName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors duration-200"
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