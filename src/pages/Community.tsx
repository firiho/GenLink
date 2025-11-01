import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Users, UsersRound, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PeopleTab } from '@/components/community/PeopleTab';
import { TeamsTab } from '@/components/community/TeamsTab';
import { EventsTab } from '@/components/community/EventsTab';

const Community = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial tab from URL path
  const getTabFromPath = (pathname: string): 'people' | 'teams' | 'events' => {
    if (pathname.includes('/community/teams')) return 'teams';
    if (pathname.includes('/community/events')) return 'events';
    return 'people';
  };
  
  const [activeTab, setActiveTab] = useState<'people' | 'teams' | 'events'>(() => 
    getTabFromPath(location.pathname)
  );
  
  // Update tab when URL changes
  useEffect(() => {
    const newTab = getTabFromPath(location.pathname);
    setActiveTab(newTab);
  }, [location.pathname]);
  
  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'people' | 'teams' | 'events');
    
    // Update URL without page reload
    const newPath = value === 'people' ? '/community' : `/community/${value}`;
    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Tabs Section */}
      <section className="pt-24 pb-24 relative">
        <div className="container mx-auto px-4">
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="inline-flex h-auto p-1 bg-card border border-border rounded-full shadow-sm">
                <TabsTrigger 
                  value="people" 
                  className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-full transition-all"
                >
                  <Users className="h-4 w-4" />
                  <span className="font-medium">People</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="teams" 
                  className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-full transition-all"
                >
                  <UsersRound className="h-4 w-4" />
                  <span className="font-medium">Teams</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-full transition-all"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Events</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div
            >
              <TabsContent value="people" className="mt-0">
                <PeopleTab />
              </TabsContent>

              <TabsContent value="teams" className="mt-0">
                <TeamsTab />
              </TabsContent>

              <TabsContent value="events" className="mt-0">
                <EventsTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Community;
