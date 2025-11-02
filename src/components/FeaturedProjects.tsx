import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Project } from '@/types/project';
import { format } from 'date-fns';

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const getProjectsFunction = httpsCallable(functions, 'projects');
        
        // Fetch public submitted projects
        const result = await getProjectsFunction({
          limit: 50, // Fetch more to get better random selection
          cursor: null,
          searchQuery: '',
          categoryFilter: undefined,
        });

        const data = result.data as {
          success: boolean;
          projects: Project[];
          hasMore: boolean;
          nextCursor: string | null;
        };

        if (data.success && data.projects.length > 0) {
          // Randomly select 3 projects
          const shuffled = [...data.projects].sort(() => 0.5 - Math.random());
          const selectedProjects = shuffled.slice(0, 3);
          setProjects(selectedProjects);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured projects:', error);
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  // Don't render section if there are no projects and loading is complete
  if (!loading && projects.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-background relative">
      {/* Minimal Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-tech-grid opacity-[0.01]" />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-16 text-center lg:text-left">
          <div className="flex-1 mb-8 lg:mb-0">
            <div className="flex justify-center lg:justify-start items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium">
                Featured Projects
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              <span className="gradient-text">Innovation Showcase</span>
              <br />
              <span className="gradient-text-primary">In Action</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
              Explore groundbreaking projects built by talented creators solving real-world challenges
            </p>
          </div>
          <Link to="/projects" className="w-full lg:w-auto">
            <div>
              <Button 
                variant="outline"
                className="border-border hover:bg-accent/5 text-foreground font-medium px-6 py-3 rounded-lg transition-all duration-200 group w-full lg:w-auto"
              >
                View All Projects
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Clean Loading Skeletons
            [...Array(3)].map((_, index) => (
              <div key={index} className="group relative">
                <div className="p-6 rounded-lg border border-border bg-card">
                  <Skeleton className="h-48 w-full rounded-lg mb-6 bg-muted" />
                  <Skeleton className="h-6 w-3/4 mb-3 bg-muted" />
                  <Skeleton className="h-4 w-1/2 mb-6 bg-muted" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20 bg-muted" />
                    <Skeleton className="h-4 w-24 bg-muted" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            projects.map((project) => {
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
                <Link
                  key={project.id}
                  to={`/p/${project.id}`}
                  className="group relative transform transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="p-6 rounded-lg border border-border bg-card hover:border-accent/30 hover:shadow-lg transition-all duration-300 h-full">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors line-clamp-2">
                          {project.title}
                        </h3>
                        {project.challengeTitle && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Submitted for <span className="font-medium text-foreground">{project.challengeTitle}</span>
                          </p>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {project.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        {formattedDate && (
                          <span className="text-xs text-muted-foreground">
                            {formattedDate}
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                    
                    {project.categories && project.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium border border-accent/20"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

