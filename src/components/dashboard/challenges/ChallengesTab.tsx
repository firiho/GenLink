import { useEffect, useState } from 'react';
import { Trophy, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ChallengeCard from '@/components/dashboard/challenges/ChallengeCard';
import SearchAndFilter from '@/components/dashboard/challenges/SearchAndFilter';
import useChallenges from '@/components/dashboard/challenges/useChallenges';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { Button } from '@/components/ui/button';

export default function ChallengesTab({setActiveView}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [userChallenges, setUserChallenges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const { user } = useAuth();

    useEffect(() => {
        const fetchUserChallenges = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                
                // Get the user's joined challenges from their profile subcollection
                const userChallengesRef = collection(db, 'profiles', user.uid, 'challenges');
                const userChallengesSnap = await getDocs(userChallengesRef);
                
                // Create an array to hold the full challenge data
                const challengesData = [];
                
                // For each user challenge reference, get the full challenge data
                for (const challengeDoc of userChallengesSnap.docs) {
                    const challengeId = challengeDoc.id;
                    const userChallengeData = challengeDoc.data();
                    
                    // Get the full challenge data from the challenges collection
                    const challengeRef = doc(db, 'challenges', challengeId);
                    const challengeSnap = await getDoc(challengeRef);
                    
                    if (challengeSnap.exists()) {
                        const challengeData = challengeSnap.data();
                        
                        // Get the submission data to track progress
                        const submissionId = `${user.uid}_${challengeId}`;
                        const submissionRef = doc(db, 'submissions', submissionId);
                        const submissionSnap = await getDoc(submissionRef);
                        const submissionData = submissionSnap.exists() ? submissionSnap.data() : null;
                        
                        // Calculate days left
                        const deadlineDate = challengeData.deadline ? new Date(challengeData.deadline) : null;
                        const today = new Date();
                        const daysLeft = deadlineDate 
                            ? Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                            : 0;
                        
                        // Format the challenge with all necessary data
                        challengesData.push({
                            id: challengeId,
                            title: challengeData.title || 'Unnamed Challenge',
                            description: challengeData.description || '',
                            organization: challengeData.companyInfo?.name || 'Unknown Organization',
                            participants: challengeData.participants || 0,
                            status: userChallengeData.status || 'in-progress',
                            submissions: 0, // This could be fetched if needed
                            progress: submissionData?.progress || 0,
                            daysLeft: daysLeft,
                            prize: challengeData.total_prize ? `$${challengeData.total_prize.toLocaleString()}` : 'No prize',
                            deadline: challengeData.deadline || null,
                            joinedAt: userChallengeData.joinedAt || null,
                            image: challengeData.coverImageUrl || "/placeholder-challenge.jpg"
                        });
                    }
                }
                
                setUserChallenges(challengesData);
            } catch (error) {
                console.error("Error fetching user challenges:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUserChallenges();
    }, [user]);
    
    const filteredChallenges = useChallenges(userChallenges, searchQuery, selectedFilter);
    
    // Pagination logic
    const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentChallenges = filteredChallenges.slice(startIndex, endIndex);
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedFilter]);

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col space-y-6">
                <WelcomeSection title="Your Challenges" subtitle="Manage and track your innovation challenges" />
                
                {/* Search, Filter, and View Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <SearchAndFilter 
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            selectedFilter={selectedFilter}
                            setSelectedFilter={setSelectedFilter}
                        />
                    </div>
                    
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">View:</span>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-8 w-8 p-0"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="h-8 w-8 p-0"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                // Loading state
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}>
                    {Array.from({ length: itemsPerPage }).map((_, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Challenges Display */}
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}>
                        {currentChallenges.map((challenge, index) => (
                            <ChallengeCard 
                                key={challenge.id} 
                                challenge={challenge} 
                                index={index} 
                                setActiveTab={setActiveView}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-6">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredChallenges.length)} of {filteredChallenges.length} challenges
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
                </>
            )}

            {!isLoading && filteredChallenges.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Trophy className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No challenges found</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                        {userChallenges.length === 0 
                            ? "You haven't joined any challenges yet. Start your innovation journey today!" 
                            : "Try adjusting your search or filters to find what you're looking for."}
                    </p>
                    {userChallenges.length === 0 && (
                        <Button 
                            className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
                            onClick={() => setActiveView('challenges')}
                        >
                            Browse Available Challenges
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}