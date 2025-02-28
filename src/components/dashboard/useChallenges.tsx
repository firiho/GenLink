import { useMemo } from 'react';

const useChallenges = (allChallenges, searchQuery, selectedFilter) => {
    return useMemo(() => {
      return allChallenges.filter(challenge => {
        const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            challenge.organization.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || challenge.status.toLowerCase() === selectedFilter;
        return matchesSearch && matchesFilter;
      });
    }, [allChallenges, searchQuery, selectedFilter]);
  };

export default useChallenges;