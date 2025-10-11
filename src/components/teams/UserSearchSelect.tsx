import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Search, X, UserPlus } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  id: string;
  displayName: string;
  email: string;
}

interface UserSearchSelectProps {
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  onUserRemove: (userId: string) => void;
  excludeUserId?: string; // Exclude current user
}

export default function UserSearchSelect({ 
  selectedUsers, 
  onUserSelect, 
  onUserRemove,
  excludeUserId 
}: UserSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Fetch details of selected users
    const fetchSelectedUsers = async () => {
      if (selectedUsers.length === 0) {
        setSelectedUserDetails([]);
        return;
      }

      const usersData: User[] = [];
      for (const userId of selectedUsers) {
        const profileDoc = await getDocs(
          query(collection(db, 'profiles'), where('__name__', '==', userId), limit(1))
        );
        if (!profileDoc.empty) {
          const data = profileDoc.docs[0].data();
          usersData.push({
            id: userId,
            displayName: data.displayName || data.name || 'Unknown',
            email: data.email || ''
          });
        }
      }
      setSelectedUserDetails(usersData);
    };

    fetchSelectedUsers();
  }, [selectedUsers]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Search by email or name (simplified)
      const usersQuery = query(
        collection(db, 'profiles'),
        where('user_type', '==', 'participant'),
        limit(10)
      );
      
      const usersSnap = await getDocs(usersQuery);
      const users: User[] = [];
      
      usersSnap.docs.forEach(doc => {
        const data = doc.data();
        const displayName = data.displayName || data.name || '';
        const email = data.email || '';
        
        // Filter by search query
        if (
          displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          if (doc.id !== excludeUserId && !selectedUsers.includes(doc.id)) {
            users.push({
              id: doc.id,
              displayName,
              email
            });
          }
        }
      });
      
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="pl-10 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg max-h-48 overflow-y-auto bg-white dark:bg-slate-900">
          {searchResults.map(user => (
            <button
              key={user.id}
              onClick={() => {
                onUserSelect(user.id);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <Avatar className="h-8 w-8 bg-slate-100 dark:bg-slate-700">
                <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                  {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user.displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
              <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </button>
          ))}
        </div>
      )}

      {/* Selected Users */}
      {selectedUserDetails.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Selected Team Members ({selectedUserDetails.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedUserDetails.map(user => (
              <Badge
                key={user.id}
                variant="secondary"
                className="pl-2 pr-1 py-1.5 flex items-center gap-2"
              >
                <span className="text-sm">{user.displayName}</span>
                <button
                  onClick={() => onUserRemove(user.id)}
                  className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

