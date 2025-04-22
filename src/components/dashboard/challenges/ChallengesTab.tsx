import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ChallengeCard from '@/components/dashboard/challenges/ChallengeCard';
import SearchAndFilter from '@/components/dashboard/challenges/SearchAndFilter';
import useChallenges from '@/components/dashboard/challenges/useChallenges';
import WelcomeSection from '@/components/dashboard/WelcomeSection';

export default function ChallengesTab({setActiveView}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [userChallenges, setUserChallenges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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

    return (
        <div className="space-y-4 sm:space-y-6 mt-5">
            <div className="flex flex-col space-y-4">
                <WelcomeSection title="Your Challenges" subtitle="Manage and track your innovation challenges" />
                <SearchAndFilter 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                />
            </div>

            {isLoading ? (
                // Loading state
                <div className="space-y-3">
                    {[1, 2, 3].map((index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-4 animate-pulse">
                            <div className="h-20 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-10 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredChallenges.map((challenge, index) => (
                        <ChallengeCard key={challenge.id} challenge={challenge} index={index} setActiveTab={setActiveView}/>
                    ))}
                </div>
            )}

            {!isLoading && filteredChallenges.length === 0 && (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        <Trophy className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No challenges found</h3>
                    <p className="text-sm text-gray-500">
                        {userChallenges.length === 0 
                            ? "You haven't joined any challenges yet" 
                            : "Try adjusting your search or filters"}
                    </p>
                </div>
            )}
        </div>
    );
}