import { ArrowRight } from 'lucide-react';
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
              const youtubeId = project.youtubeVideoId;
              const thumbnailUrl = youtubeId 
                ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` 
                : null;

              return (
                <Link
                  key={project.id}
                  to={`/p/${project.id}`}
                  className="group block h-full"
                >
                  <div className="h-full rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 flex flex-col">
                    {/* Image or Pattern Header */}
                    <div className="relative h-48 overflow-hidden bg-muted/30">
                      {thumbnailUrl ? (
                        <>
                          <img 
                            src={thumbnailUrl} 
                            alt={project.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
                          {/* Play Icon Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/5 to-primary/5 group-hover:from-accent/10 group-hover:to-primary/10 transition-colors">
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {project.categories && project.categories.length > 0 && (
                          <div className="absolute top-3 right-3">
                              <span className="px-2 py-1 rounded-md bg-background/80 backdrop-blur-md border border-white/10 text-xs font-medium shadow-sm">
                                  {project.categories[0]}
                              </span>
                          </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow relative">
                      {/* Challenge Context */}
                      {project.challengeTitle && (
                          <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider line-clamp-1">
                              {project.challengeTitle}
                          </div>
                      )}

                      <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors line-clamp-2">
                        {project.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.description}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                  {formattedDate ? `Submitted ${formattedDate}` : 'Recently submitted'}
                              </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors transform group-hover:translate-x-1" />
                      </div>
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

