import { useEffect, useState } from 'react';
import { FolderPlus, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/dashboard/projects/ProjectCard';
import { toast } from 'sonner';
import { TeamService } from '@/services/teamService';

export default function ProjectsTab({setActiveView}) {
    const [userProjects, setUserProjects] = useState([]);
    const [allChallenges, setAllChallenges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'individual', 'team'
    const [challengeFilter, setChallengeFilter] = useState('all'); // 'all' or challengeId
    const { user } = useAuth();

    useEffect(() => {
        const fetchUserProjects = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                
                // Get projects where user is owner (individual)
                const projectsQuery = query(
                    collection(db, 'projects'),
                    where('userId', '==', user.uid)
                );
                const projectsSnap = await getDocs(projectsQuery);
                
                // Get user's teams to fetch team projects (only if user has teams)
                let teamProjects = [];
                const userTeams = await TeamService.getUserTeams(user.uid);
                if (userTeams.length > 0) {
                    const teamIds = userTeams.map(team => team.id);
                    
                    // Fetch team projects
                    const teamProjectsPromises = teamIds.map(async (teamId) => {
                        const teamProjectsQuery = query(
                            collection(db, 'projects'),
                            where('teamId', '==', teamId)
                        );
                        const teamProjectsSnap = await getDocs(teamProjectsQuery);
                        return teamProjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    });
                    
                    const teamProjectsArrays = await Promise.all(teamProjectsPromises);
                    teamProjects = teamProjectsArrays.flat();
                }
                
                // Combine individual and team projects, deduplicate by ID
                const allProjectsMap = new Map();
                
                // Add individual projects
                for (const projectDoc of projectsSnap.docs) {
                    const projectData = projectDoc.data();
                    allProjectsMap.set(projectDoc.id, {
                        id: projectDoc.id,
                        ...projectData
                    });
                }
                
                // Add team projects (will overwrite if same ID, but should be fine since they're the same project)
                for (const projectData of teamProjects) {
                    if (!allProjectsMap.has(projectData.id)) {
                        allProjectsMap.set(projectData.id, projectData);
                    }
                }
                
                const allProjects = Array.from(allProjectsMap.values());
                const projectsData = [];
                
                // Only fetch challenges if there are projects
                if (allProjects.length > 0) {
                    // Collect unique challenge IDs
                    const challengeIds = new Set();
                    for (const projectData of allProjects) {
                        if (projectData.challengeId) {
                            challengeIds.add(projectData.challengeId);
                        }
                    }
                    
                    // Fetch all challenge data in one batch (only if we have challenge IDs)
                    if (challengeIds.size > 0) {
                        const challengePromises = Array.from(challengeIds).map(async (challengeId) => {
                            const challengeRef = doc(db, 'challenges', challengeId as string);
                            const challengeSnap = await getDoc(challengeRef);
                            const challengeData = challengeSnap.exists() ? challengeSnap.data() : null;
                            return challengeData ? { id: challengeId as string, title: challengeData.title || 'Unknown' } : null;
                        });
                        
                        const challenges = (await Promise.all(challengePromises)).filter(Boolean);
                        setAllChallenges(challenges);
                        
                        // Map challenge titles to projects
                        const challengeMap = new Map(challenges.map(c => [c.id, c.title]));
                        
                        // Process all projects (already deduplicated by Map)
                        for (const projectData of allProjects) {
                            projectsData.push({
                                id: projectData.id,
                                ...projectData,
                                challengeTitle: challengeMap.get(projectData.challengeId) || 'Unknown Challenge',
                                createdAt: projectData.createdAt?.toDate ? projectData.createdAt.toDate() : new Date(projectData.createdAt),
                                updatedAt: projectData.updatedAt?.toDate ? projectData.updatedAt.toDate() : new Date(projectData.updatedAt),
                            });
                        }
                    } else {
                        // No challenge IDs, process projects without challenge titles
                        for (const projectData of allProjects) {
                            projectsData.push({
                                id: projectData.id,
                                ...projectData,
                                challengeTitle: 'Unknown Challenge',
                                createdAt: projectData.createdAt?.toDate ? projectData.createdAt.toDate() : new Date(projectData.createdAt),
                                updatedAt: projectData.updatedAt?.toDate ? projectData.updatedAt.toDate() : new Date(projectData.updatedAt),
                            });
                        }
                        setAllChallenges([]);
                    }
                } else {
                    // No projects, set empty challenges
                    setAllChallenges([]);
                }
                
                setUserProjects(projectsData);
            } catch (error) {
                console.error("Error fetching user projects:", error);
                toast.error('Error loading projects');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUserProjects();
    }, [user]);
    
    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, challengeFilter]);
    
    // Filter projects
    const filteredProjects = userProjects.filter(project => {
        const matchesType = typeFilter === 'all' || 
                           (typeFilter === 'individual' && !project.teamId) ||
                           (typeFilter === 'team' && project.teamId);
        const matchesChallenge = challengeFilter === 'all' || project.challengeId === challengeFilter;
        return matchesType && matchesChallenge;
    });
    
    // Pagination logic
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProjects = filteredProjects.slice(startIndex, endIndex);
    

    // Check for project creation context from challenges view
    useEffect(() => {
        const contextStr = sessionStorage.getItem('projectChallengeContext');
        if (contextStr) {
            try {
                const context = JSON.parse(contextStr);
                sessionStorage.removeItem('projectChallengeContext');
                // Navigate to create project with context
                setActiveView('create-project', context);
            } catch (error) {
                console.error('Error parsing project context:', error);
                sessionStorage.removeItem('projectChallengeContext');
            }
        }
    }, [setActiveView]);

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col space-y-6">
                <WelcomeSection title="Your Projects" subtitle="Manage and track your innovation projects" />
                
                {/* Filters and Create Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Filter Tabs - Compact, grouped on same row */}
                    <div className="flex flex-wrap items-center gap-3 pb-2 flex-1">
                        {/* Type Filter Group */}
                        <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Type:</span>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => setTypeFilter('all')}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                            typeFilter === 'all'
                                                ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setTypeFilter('individual')}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                            typeFilter === 'individual'
                                                ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        Individual
                                    </button>
                                    <button
                                        onClick={() => setTypeFilter('team')}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                            typeFilter === 'team'
                                                ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        Team
                                    </button>
                                </div>
                            </div>
                            
                            {/* Challenge Filter Group - Dropdown */}
                            {allChallenges.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Challenge:</span>
                                    <select
                                        value={challengeFilter}
                                        onChange={(e) => setChallengeFilter(e.target.value)}
                                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 min-w-[150px]"
                                    >
                                        <option value="all">All Challenges</option>
                                        {allChallenges.map(challenge => (
                                            <option key={challenge.id} value={challenge.id}>
                                                {challenge.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    
                    {/* Create Button */}
                    <Button 
                        onClick={() => setActiveView('create-project')}
                        className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 whitespace-nowrap"
                    >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Create Project
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                {isLoading ? (
                    <div>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 animate-pulse last:border-b-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Projects Display - Table-like List */}
                        {currentProjects.length > 0 ? (
                            currentProjects.map((project, index) => (
                                <ProjectCard 
                                    key={project.id} 
                                    project={project} 
                                    index={index} 
                                    setActiveView={setActiveView}
                                    viewMode="list"
                                />
                            ))
                        ) : (
                            <div className="px-4 py-12 text-center">
                                <FolderOpen className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400">No projects found</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-between pt-6">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

