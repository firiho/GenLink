import { useMemo } from 'react';

export default function useChallenges(challenges, searchQuery, statusFilter) {
  return useMemo(() => {
    return challenges.filter(challenge => {
      // Search filter
      const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           challenge.organization.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = challenge.status === statusFilter;
        
        // Special case for "upcoming" filter - check if the challenge hasn't started yet
        if (statusFilter === 'upcoming') {
          const joinedDate = challenge.joinedAt ? new Date(challenge.joinedAt) : null;
          const now = new Date();
          matchesStatus = joinedDate && joinedDate > now;
        }
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [challenges, searchQuery, statusFilter]);
}