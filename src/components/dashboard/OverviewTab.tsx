import { ChevronRight, Star, Target, Trophy, Users, Clock } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import SearchAndFilter from '@/components/dashboard/challenges/SearchAndFilter';
import ChallengeCard from '@/components/dashboard/challenges/ChallengeCard';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import useChallenges from '@/components/dashboard/challenges/useChallenges';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { set } from 'date-fns';

export default function OverviewTab({setActiveView, user}) {
    const [showAllChallenges, setShowAllChallenges] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [statsData, setStatsData] = useState({
        active_challenges: '0',
        total_active_team_members: '0',
        total_submissions: '0',
        success_rate: '0%'
    });
    const [loading, setLoading] = useState(true);
    const [userChallenges, setUserChallenges] = useState([]);
    const [recentChallenges, setRecentChallenges] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const db = getFirestore();
                
                // Using direct document reference with user.uid
                const profileDocRef = doc(db, 'public_profiles', user?.uid);
                const profileSnapshot = await getDoc(profileDocRef);
                
                if (profileSnapshot.exists()) {
                    const profileData = profileSnapshot.data();
                    setStatsData({
                        active_challenges: profileData.active_challenges?.toString() || '0',
                        total_active_team_members: profileData.total_active_team_members?.toString() || '0',
                        total_submissions: profileData.total_submissions?.toString() || '0',
                        success_rate: `${profileData.success_rate || 0}%`
                    });
                } else {
                    console.log("No profile document found for this user");
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
    
        if (user?.uid) {
            fetchStats();
        }
    }, [user]);

    // Fetch user's challenges
    useEffect(() => {
        const fetchUserChallenges = async () => {
            if (!user?.uid) return;

            try {
                setLoading(true);
                
                // Get the user's joined challenges from their profile subcollection
                const userChallengesRef = collection(db, 'profiles', user.uid, 'challenges');
                const userChallengesSnap = await getDocs(userChallengesRef);
                
                const challengesData = [];
                const recentInProgressChallenges = [];
                
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
                        
                        const formattedChallenge = {
                            id: challengeId,
                            title: challengeData.title || 'Unnamed Challenge',
                            description: challengeData.description || '',
                            organization: challengeData.companyInfo?.name || 'Unknown Organization',
                            participants: challengeData.participants || 0,
                            status: userChallengeData.status || 'in-progress',
                            submissions: 0,
                            progress: submissionData?.progress || 0,
                            daysLeft: daysLeft,
                            prize: challengeData.total_prize ? `$${challengeData.total_prize.toLocaleString()}` : 'No prize',
                            deadline: challengeData.deadline || null,
                            joinedAt: userChallengeData.joinedAt ? new Date(userChallengeData.joinedAt) : new Date(),
                            image: challengeData.coverImageUrl || "/placeholder-challenge.jpg"
                        };
                        
                        challengesData.push(formattedChallenge);
                        
                        // Add to recent challenges if status is in-progress
                        if (userChallengeData.status === 'in-progress') {
                            recentInProgressChallenges.push(formattedChallenge);
                        }
                    }
                }
                
                // Sort recent challenges by joined date (newest first)
                recentInProgressChallenges.sort((a, b) => b.joinedAt - a.joinedAt);
                
                setUserChallenges(challengesData);
                setRecentChallenges(recentInProgressChallenges.slice(0, 5)); // Show only 5 most recent
                
            } catch (error) {
                console.error("Error fetching user challenges:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserChallenges();
    }, [user]);

    const stats = [
        { 
            label: 'Active Challenges', 
            value: statsData.active_challenges, 
            change: '+0 this month',
            icon: Trophy,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        { 
            label: 'Team Members', 
            value: statsData.total_active_team_members, 
            change: '+0 this month',
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        { 
            label: 'Total Submissions', 
            value: statsData.total_submissions, 
            change: '+0 this week',
            icon: Target,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        { 
            label: 'Success Rate', 
            value: statsData.success_rate, 
            change: '+0% this month',
            icon: Star,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        }
    ];

    const filteredChallenges = useChallenges(userChallenges, searchQuery, selectedFilter);
    const displayedChallenges = showAllChallenges ? filteredChallenges : filteredChallenges.slice(0, 3);

    return (
        <div className="space-y-5 sm:space-y-6 lg:space-y-8 mt-5">
            <WelcomeSection title={`Welcome ${user?.fullName || 'User'}!`} subtitle={"Here's what's happening with your challenges"} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat, index) => (
                    <StatsCard key={stat.label} stat={stat} index={index} loading={loading} />
                ))}
            </div>

            {/* Recent In-Progress Challenges Section */}
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent In-Progress Challenges</h2>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:bg-primary/5"
                        onClick={() => setActiveView('challenges')}
                    >
                        View All
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>

                {loading ? (
                    // Loading skeleton for recent challenges
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center p-2 animate-pulse">
                                <div className="w-10 h-10 bg-gray-200 rounded mr-3"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="w-20 h-6 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : recentChallenges.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {recentChallenges.map((challenge) => (
                            <RecentChallengeItem 
                                key={challenge.id} 
                                challenge={challenge} 
                                onClick={() => setActiveView('do-challenge', challenge.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        No in-progress challenges found
                    </div>
                )}
            </div>
        </div>
    );
}

// Component for Recent Challenge List Item
function RecentChallengeItem({ challenge, onClick }) {
    return (
        <div 
            className="flex items-center py-3 px-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            onClick={onClick}
        >
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                <img 
                    src={challenge.image}
                    alt={challenge.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        img.src = "/placeholder-challenge.jpg";
                    }}
                />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{challenge.title}</h3>
                    <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">
                        {challenge.daysLeft > 0 ? `${challenge.daysLeft} days left` : 'Ended'}
                    </Badge>
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                    <span className="truncate">{challenge.organization}</span>
                    <span className="mx-1.5">•</span>
                    <div className="flex items-center">
                        <span>{challenge.progress}% complete</span>
                    </div>
                </div>
                
                <div className="mt-1.5">
                    <Progress value={challenge.progress} className="h-1" />
                </div>
            </div>
        </div>
    );
}