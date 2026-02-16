import { useState, useEffect } from 'react';
import { 
  Trophy, Users, ArrowRight, Timer, Search, 
  CalendarDays, Sliders, X, Globe, ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { formatCurrency, convertToUSD } from '@/lib/currency';

export default function PublicChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: {
      active: true,
      upcoming: false,
      ended: false,
    },
    prizeRange: {
      any: true,
      under1k: false,
      '1k-5k': false,
      '5k-10k': false,
      over10k: false
    }
  });

  // Fetch challenges from Firebase
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoading(true);
        
        // Create a query for public challenges only
        const challengesRef = collection(db, 'challenges');
        const challengesQuery = query(
          challengesRef,
          where('visibility', '==', 'public'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const challengesSnapshot = await getDocs(challengesQuery);
        const challengesList = [];
        const categoriesSet = new Set();
        
        challengesSnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Convert Firebase timestamp to JS Date
          const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date();
          const deadlineDate = data.deadline ? new Date(data.deadline) : null;
          
          // Calculate days left till deadline
          const today = new Date();
          const daysLeft = deadlineDate 
            ? Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          
          // Add all categories to our set
          if (data.categories && data.categories.length) {
            data.categories.forEach(category => categoriesSet.add(category));
          }
          
          // Create challenge object
          const challenge = {
            id: doc.id,
            title: data.title || 'Unnamed Challenge',
            organizer: data.companyInfo?.name || 'Unknown Organizer',
            organizerLogo: data.companyInfo?.logoUrl || null,
            prize: data.prize || 'No prize information',
            total_prize: data.total_prize || 0,
            currency: data.currency,
            participants: data.participants || Math.floor(Math.random() * 100), // Placeholder for demo
            daysLeft: daysLeft,
            image: data.coverImageUrl || "/placeholder-challenge.jpg",
            category: data.categories && data.categories.length ? data.categories[0] : 'Uncategorized',
            categories: data.categories || [],
            featured: data.featured || false,
            deadline: data.deadline || null,
            description: data.description || '',
            skills: data.skills || [],
            createdAt: createdAt
          };
          
          challengesList.push(challenge);
        });
        
        setChallenges(challengesList);
        setFilteredChallenges(challengesList);
        setAvailableCategories(Array.from(categoriesSet));
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChallenges();
  }, []);

  // Update filters
  const updateFilter = (section, key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      // If it's a single selection section like status, uncheck all others
      if (['status', 'prizeRange'].includes(section)) {
        Object.keys(newFilters[section]).forEach(k => {
          newFilters[section][k] = k === key;
        });
      } else {
        // Toggle the value
        newFilters[section][key] = !newFilters[section][key];
      }
      return newFilters;
    });
  };

  // Filter challenges based on all criteria
  useEffect(() => {
    let results = challenges;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(challenge => 
        challenge.title.toLowerCase().includes(term) || 
        challenge.organizer.toLowerCase().includes(term) ||
        challenge.description.toLowerCase().includes(term) ||
        challenge.categories.some(cat => cat.toLowerCase().includes(term)) ||
        challenge.skills.some(skill => skill.toLowerCase().includes(term))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      results = results.filter(challenge => 
        challenge.categories.includes(selectedCategory)
      );
    }
    
    // Filter by status
    if (filters.status.active && !filters.status.upcoming && !filters.status.ended) {
      results = results.filter(challenge => challenge.daysLeft > 0);
    } else if (!filters.status.active && filters.status.upcoming) {
      // For demo, no "upcoming" challenges, but this would filter for future start dates
      // results = results.filter(challenge => challenge.startDate > new Date());
    } else if (!filters.status.active && !filters.status.upcoming && filters.status.ended) {
      results = results.filter(challenge => challenge.daysLeft <= 0);
    }
    
    // Filter by prize range (convert each challenge's prize to USD for comparison)
    if (!filters.prizeRange.any) {
      if (filters.prizeRange.under1k) {
        results = results.filter(challenge => convertToUSD(challenge.total_prize, challenge.currency) < 1000);
      } else if (filters.prizeRange['1k-5k']) {
        results = results.filter(challenge => {
          const usd = convertToUSD(challenge.total_prize, challenge.currency);
          return usd >= 1000 && usd < 5000;
        });
      } else if (filters.prizeRange['5k-10k']) {
        results = results.filter(challenge => {
          const usd = convertToUSD(challenge.total_prize, challenge.currency);
          return usd >= 5000 && usd < 10000;
        });
      } else if (filters.prizeRange.over10k) {
        results = results.filter(challenge => convertToUSD(challenge.total_prize, challenge.currency) >= 10000);
      }
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      results = [...results].sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'prize') {
      results = [...results].sort((a, b) => convertToUSD(b.total_prize, b.currency) - convertToUSD(a.total_prize, a.currency));
    } else if (sortBy === 'deadline') {
      results = [...results].sort((a, b) => a.daysLeft - b.daysLeft);
    }
    
    setFilteredChallenges(results);
  }, [challenges, searchTerm, selectedCategory, sortBy, filters]);

  // Challenge card skeleton for loading state
  const ChallengeSkeletonCard = () => (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <Skeleton className="w-full md:w-64 h-48 md:h-full" />
        <div className="p-5 flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-5/6" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    </div>
  );

  // Header and search bar
  const SearchHeader = () => (
    <div className="mb-8">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          className="pl-10 pr-4 py-3 w-full text-base border-border focus:border-accent"
          placeholder="Search challenges, technologies, keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );

  // Mobile filters toggle
  const MobileFiltersToggle = () => (
    <div className="md:hidden mb-4">
      <Button 
        variant="outline" 
        className="w-full flex justify-between items-center"
        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
      >
        <span className="flex items-center">
          <Sliders className="mr-2 h-4 w-4" />
          Filter Challenges
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  );

  // Left sidebar with filters
  const FilterSidebar = ({ className = "" }) => (
    <div className={`bg-card rounded-lg border border-border p-5 space-y-6 ${className}`}>
      <div className="pb-4 border-b border-border">
        <h3 className="text-lg font-semibold mb-3 text-foreground">Sort By</h3>
        <div className="space-y-2">
          {['newest', 'prize', 'deadline'].map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="radio"
                id={`sort-${option}`}
                name="sortOption"
                checked={sortBy === option}
                onChange={() => setSortBy(option)}
                className="mr-2"
              />
              <label htmlFor={`sort-${option}`} className="text-sm cursor-pointer">
                {option === 'newest' 
                  ? 'Newest First' 
                  : option === 'prize' 
                    ? 'Highest Prize' 
                    : 'Closing Soon'}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-4 border-b border-border">
        <h3 className="text-lg font-semibold mb-3 text-foreground">Status</h3>
        <div className="space-y-2">
          {Object.keys(filters.status).map((status) => (
            <div key={status} className="flex items-center">
              <Checkbox
                id={`status-${status}`}
                checked={filters.status[status]}
                onCheckedChange={() => updateFilter('status', status)}
                className="mr-2"
              />
              <label htmlFor={`status-${status}`} className="text-sm cursor-pointer capitalize text-foreground">
                {status === 'active' ? 'Open for Submission' : status}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-4 border-b border-border">
        <h3 className="text-lg font-semibold mb-3 text-foreground">Award Range</h3>
        <div className="space-y-2">
          {Object.keys(filters.prizeRange).map((range) => (
            <div key={range} className="flex items-center">
              <Checkbox
                id={`prize-${range}`}
                checked={filters.prizeRange[range]}
                onCheckedChange={() => updateFilter('prizeRange', range)}
                className="mr-2"
              />
              <label htmlFor={`prize-${range}`} className="text-sm cursor-pointer text-foreground">
                {range === 'any' 
                  ? 'Any' 
                  : range === 'under1k' 
                    ? 'Under $1,000' 
                    : range === '1k-5k' 
                      ? '$1,000 - $5,000' 
                      : range === '5k-10k' 
                        ? '$5,000 - $10,000' 
                        : 'Over $10,000'}
              </label>
            </div>
          ))}
        </div>
      </div>

      {availableCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-foreground">Categories</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            <div className="flex items-center">
              <Checkbox
                id="category-all"
                checked={selectedCategory === ''}
                onCheckedChange={() => setSelectedCategory('')}
                className="mr-2"
              />
              <label htmlFor="category-all" className="text-sm cursor-pointer text-foreground">
                All Categories
              </label>
            </div>
            {availableCategories.map((category) => (
              <div key={category} className="flex items-center">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategory === category}
                  onCheckedChange={() => setSelectedCategory(category === selectedCategory ? '' : category)}
                  className="mr-2"
                />
                <label htmlFor={`category-${category}`} className="text-sm cursor-pointer text-foreground">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('');
            setSortBy('newest');
            setFilters({
              status: { active: true, upcoming: false, ended: false },
              prizeRange: { any: true, under1k: false, '1k-5k': false, '5k-10k': false, over10k: false }
            });
          }}
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  // Challenge card in list view - compact and clickable
  const ChallengeCard = ({ challenge }) => (
    <Link to={`/challenge/${challenge.id}`}>
      <div className="bg-card rounded-lg border border-border hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 overflow-hidden cursor-pointer group">
        <div className="flex gap-4 p-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
            <img 
              src={challenge.image || "/placeholder-challenge.jpg"} 
              alt={challenge.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-challenge.jpg";
              }}
            />
            {challenge.featured && (
              <Badge className="absolute top-1 right-1 bg-primary text-white text-xs px-1.5 py-0">
                <Trophy className="w-3 h-3 mr-0.5" />
                Featured
              </Badge>
            )}
            {challenge.daysLeft <= 3 && challenge.daysLeft > 0 && (
              <Badge variant="destructive" className="absolute top-1 left-1 text-xs px-1.5 py-0">
                Soon
              </Badge>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold mb-1.5 group-hover:text-accent transition-colors line-clamp-1 text-foreground">
                  {challenge.title}
                </h3>
              </div>
              <div className="text-sm font-semibold text-primary flex-shrink-0">
                {challenge.total_prize > 0 ? formatCurrency(challenge.total_prize, challenge.currency) : challenge.prize}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {challenge.categories && challenge.categories.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {challenge.categories[0]}
                </Badge>
              )}
            </div>
            
            {challenge.organizer && (
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                {challenge.organizerLogo && (
                  <img 
                    src={challenge.organizerLogo}
                    alt={challenge.organizer}
                    className="w-3.5 h-3.5 rounded-full object-contain"
                  />
                )}
                <span className="line-clamp-1">{challenge.organizer}</span>
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {challenge.description}
            </p>
            
            <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
              {challenge.daysLeft > 0 ? (
                <div className="flex items-center">
                  <Timer className="w-3 h-3 mr-1" />
                  <span>{challenge.daysLeft} days left</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Timer className="w-3 h-3 mr-1" />
                  <span>Ended</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                <span>{challenge.participants} participants</span>
              </div>
              
              {challenge.deadline && (
                <div className="flex items-center">
                  <CalendarDays className="w-3 h-3 mr-1" />
                  <span>{format(new Date(challenge.deadline), 'MMM d')}</span>
                </div>
              )}
              
              {challenge.skills && challenge.skills.length > 0 && (
                <div className="flex items-center gap-1">
                  {challenge.skills.slice(0, 2).map(skill => (
                    <span key={skill} className="px-1.5 py-0.5 bg-accent/10 text-accent rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {challenge.skills.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{challenge.skills.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  // Empty state when no challenges found
  const EmptyState = () => (
    <div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 bg-card rounded-lg border border-border"
    >
      <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No challenges found</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        We couldn't find any challenges matching your current filters. Try adjusting your search criteria.
      </p>
      <Button 
        variant="outline" 
        onClick={() => {
          setSearchTerm('');
          setSelectedCategory('');
          setSortBy('newest');
          setFilters({
            status: { active: true, upcoming: false, ended: false },
            prizeRange: { any: true, under1k: false, '1k-5k': false, '5k-10k': false, over10k: false }
          });
        }}
      >
        Clear all filters
      </Button>
    </div>
  );

  return (
    <section className="py-12 md:py-16 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <SearchHeader />
        <MobileFiltersToggle />
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar with filters - hidden on mobile unless expanded */}
          <div className={`
            md:w-72 flex-shrink-0
            ${mobileFiltersOpen ? 'block' : 'hidden'} 
            md:block
          `}>
            <FilterSidebar className="sticky top-24" />
          </div>

          {/* Main content area */}
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, index) => (
                  <ChallengeSkeletonCard key={index} />
                ))}
              </div>
            ) : filteredChallenges.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                  <span>Showing {filteredChallenges.length} challenges</span>
                  
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    <span>All locations</span>
                  </div>
                </div>
              
                <div className="space-y-6">
                  {filteredChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
                
                {filteredChallenges.length > 10 && (
                  <div className="mt-8 text-center">
                    <Button variant="outline" className="min-w-[180px]">
                      Load More Challenges
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}