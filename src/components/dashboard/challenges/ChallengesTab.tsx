import { useEffect, useState } from 'react';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ChallengeCard from '@/components/dashboard/challenges/ChallengeCard';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

export default function ChallengesTab({setActiveView}) {
    const [userChallenges, setUserChallenges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'in-progress', 'submitted', 'completed'
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
                const userChallengesRef = collection(db, 'users', user.uid, 'challenges');
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
                        
                        // Calculate days left
                        const deadlineDate = challengeData.deadline ? new Date(challengeData.deadline) : null;
                        const today = new Date();
                        const daysLeft = deadlineDate 
                            ? Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                            : 0;
                        
                        // Format the challenge with all necessary data (no submission data needed here)
                        challengesData.push({
                            id: challengeId,
                            title: challengeData.title || 'Unnamed Challenge',
                            description: challengeData.description || '',
                            organization: challengeData.companyInfo?.name || 'Unknown Organization',
                            participants: challengeData.participants || 0,
                            status: userChallengeData.status || 'in-progress',
                            daysLeft: daysLeft,
                            prize: challengeData.total_prize ? formatCurrency(challengeData.total_prize, challengeData.currency) : 'No prize',
                            deadline: challengeData.deadline || null,
                            joinedAt: userChallengeData.joinedAt || null,
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
    
    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);
    
    // Filter challenges by status
    const filteredChallenges = userChallenges.filter(challenge => {
        if (statusFilter === 'all') return true;
        return challenge.status === statusFilter;
    });
    
    // Pagination logic
    const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentChallenges = filteredChallenges.slice(startIndex, endIndex);

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col space-y-6">
                <WelcomeSection title="Your Challenges" subtitle="Manage and track your innovation challenges" />
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            statusFilter === 'all'
                                ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter('in-progress')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            statusFilter === 'in-progress'
                                ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        Ongoing
                    </button>
                    <button
                        onClick={() => setStatusFilter('submitted')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            statusFilter === 'submitted'
                                ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        Submitted
                    </button>
                    <button
                        onClick={() => setStatusFilter('completed')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            statusFilter === 'completed'
                                ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        Completed
                    </button>
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
                        {/* Challenges Display - Table-like List */}
                        {currentChallenges.length > 0 ? (
                            currentChallenges.map((challenge, index) => (
                                <ChallengeCard 
                                    key={challenge.id} 
                                    challenge={challenge} 
                                    index={index} 
                                    setActiveTab={setActiveView}
                                    viewMode="list"
                                />
                            ))
                        ) : (
                            <div className="px-4 py-12 text-center">
                                <Trophy className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400">No challenges found</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
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
        </div>
    );
}