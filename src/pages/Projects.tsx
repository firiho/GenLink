import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Loader2, ChevronDown, Sliders, X, Calendar, Users, ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { Project } from '@/types/project';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Initialize the cloud function
const getProjectsFunction = httpsCallable(functions, 'projects');

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]); // Store all for category calculation
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Calculate available categories from all projects
  useEffect(() => {
    const categorySet = new Set<string>();
    allProjects.forEach(project => {
      if (project.categories && project.categories.length > 0) {
        project.categories.forEach(cat => categorySet.add(cat));
      }
    });
    setAvailableCategories(Array.from(categorySet).sort());
  }, [allProjects]);

  // Fetch projects when filters change
  useEffect(() => {
    fetchProjects(true);
  }, [debouncedSearch, selectedCategory]);

  // Apply client-side filters (sort, date)
  const filteredAndSortedProjects = React.useMemo(() => {
    let filtered = [...projects];

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      if (dateFilter === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(project => {
        if (!project.submittedAt) return false;
        const submitDate = project.submittedAt instanceof Date 
          ? project.submittedAt 
          : new Date(project.submittedAt);
        return submitDate >= cutoffDate;
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      const dateA = a.submittedAt 
        ? (a.submittedAt instanceof Date ? a.submittedAt : new Date(a.submittedAt))
        : new Date(0);
      const dateB = b.submittedAt 
        ? (b.submittedAt instanceof Date ? b.submittedAt : new Date(b.submittedAt))
        : new Date(0);
      
      return sortBy === 'newest' 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [projects, dateFilter, sortBy]);

  const fetchProjects = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCursor(null);
      } else {
        setLoadingMore(true);
      }

      const result = await getProjectsFunction({
        limit: 24,
        cursor: reset ? null : cursor,
        searchQuery: debouncedSearch,
        categoryFilter: selectedCategory,
      });

      const data = result.data as {
        success: boolean;
        projects: Project[];
        hasMore: boolean;
        nextCursor: string | null;
      };

      if (data.success) {
        const fetchedProjects = data.projects;
        if (reset) {
          setProjects(fetchedProjects);
          setAllProjects(fetchedProjects);
        } else {
          const updatedProjects = [...projects, ...fetchedProjects];
          setProjects(updatedProjects);
          setAllProjects(updatedProjects);
        }
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Search Header
  const SearchHeader = () => (
    <div className="mb-8">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          className="pl-10 pr-4 py-3 w-full text-base border-border focus:border-accent"
          placeholder="Search projects, technologies, keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );

  // Mobile Filters Toggle
  const MobileFiltersToggle = () => (
    <div className="md:hidden mb-4">
      <Button 
        variant="outline" 
        className="w-full flex justify-between items-center"
        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
      >
        <span className="flex items-center">
          <Sliders className="mr-2 h-4 w-4" />
          Filter Projects
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  );

  // Filter Sidebar
  const FilterSidebar = ({ className = "" }) => {
    const hasActiveFilters = searchQuery || selectedCategory !== 'All' || dateFilter !== 'all' || sortBy !== 'newest';

    return (
      <div className={`bg-card rounded-lg border border-border p-5 space-y-6 ${className}`}>
        {/* Sort By */}
        <div className="pb-4 border-b border-border">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Sort By</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-newest"
                name="sortOption"
                checked={sortBy === 'newest'}
                onChange={() => setSortBy('newest')}
                className="mr-2"
              />
              <label htmlFor="sort-newest" className="text-sm cursor-pointer text-foreground">
                Newest First
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-oldest"
                name="sortOption"
                checked={sortBy === 'oldest'}
                onChange={() => setSortBy('oldest')}
                className="mr-2"
              />
              <label htmlFor="sort-oldest" className="text-sm cursor-pointer text-foreground">
                Oldest First
              </label>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="pb-4 border-b border-border">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Submitted</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="date-all"
                name="dateOption"
                checked={dateFilter === 'all'}
                onChange={() => setDateFilter('all')}
                className="mr-2"
              />
              <label htmlFor="date-all" className="text-sm cursor-pointer text-foreground">
                All Time
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="date-week"
                name="dateOption"
                checked={dateFilter === 'week'}
                onChange={() => setDateFilter('week')}
                className="mr-2"
              />
              <label htmlFor="date-week" className="text-sm cursor-pointer text-foreground">
                This Week
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="date-month"
                name="dateOption"
                checked={dateFilter === 'month'}
                onChange={() => setDateFilter('month')}
                className="mr-2"
              />
              <label htmlFor="date-month" className="text-sm cursor-pointer text-foreground">
                This Month
              </label>
            </div>
          </div>
        </div>

        {/* Categories - Compact */}
        {availableCategories.length > 0 && (
          <div className="pb-4 border-b border-border">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Categories</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              <div className="flex items-center">
                <Checkbox
                  id="category-all"
                  checked={selectedCategory === 'All'}
                  onCheckedChange={() => setSelectedCategory('All')}
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
                    onCheckedChange={() => setSelectedCategory(selectedCategory === category ? 'All' : category)}
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

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setDateFilter('all');
                setSortBy('newest');
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Project Card Component
  const ProjectCard = ({ project }: { project: Project }) => {
    // Helper to safely format date
    const formatDate = (date: Date | undefined | string | any) => {
      if (!date) return null;
      try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return null;
        return format(dateObj, 'MMM d, yyyy');
      } catch {
        return null;
      }
    };

    const formattedDate = formatDate(project.submittedAt);

    return (
      <div
        onClick={() => navigate(`/p/${project.id}`)}
        className="group bg-card rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors line-clamp-2">
                {project.title}
              </h3>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
          </div>

        {project.challengeTitle && (
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">
              Submitted for <span className="font-medium text-foreground">{project.challengeTitle}</span>
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {project.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {project.categories && project.categories.length > 0 && (
            <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
              {project.categories[0]}
            </Badge>
          )}
          {formattedDate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          )}
        </div>

        {project.categories && project.categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {project.categories.slice(1, 4).map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
            {project.categories.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{project.categories.length - 4} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
    );
  };

  // Loading Skeleton
  const ProjectSkeleton = () => (
    <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        </div>
        <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="bg-card border border-border rounded-xl p-12 max-w-md mx-auto">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No projects found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your search or category filters
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Smaller Hero Section */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              <span className="gradient-text">Innovation Showcase</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore groundbreaking projects that are shaping Rwanda's digital future
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <SearchHeader />
          <MobileFiltersToggle />
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Sidebar - Filters */}
            <div className={`
              md:w-72 flex-shrink-0
              ${mobileFiltersOpen ? 'block' : 'hidden'} 
              md:block
            `}>
              <FilterSidebar className="sticky top-24" />
            </div>

            {/* Right Side - Projects */}
            <div className="flex-1">
              {loading ? (
                <div className="space-y-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ProjectSkeleton key={index} />
                  ))}
                </div>
              ) : filteredAndSortedProjects.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
                    <span>Showing {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''}</span>
                  </div>
                
                  <div className="space-y-6">
                    {filteredAndSortedProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button
                        onClick={() => fetchProjects(false)}
                        disabled={loadingMore}
                        variant="outline"
                        className="min-w-[180px]"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More Projects'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
