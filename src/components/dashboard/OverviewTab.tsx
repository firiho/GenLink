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
                const profileDocRef = doc(db, 'profiles', user?.uid);
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
                const userChallengesRef = collection(db, 'users', user.uid, 'challenges');
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
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <WelcomeSection 
                title={`Welcome back, ${
                    user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.firstName || user?.lastName || 'User'
                }!`} 
                subtitle={"Here's what's happening with your challenges and progress"} 
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {stats.map((stat, index) => (
                    <StatsCard key={stat.label} stat={stat} index={index} loading={loading} />
                ))}
            </div>

            {/* Recent In-Progress Challenges Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Active Challenges</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Your ongoing innovation projects</p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200 group self-start sm:self-auto"
                            onClick={() => setActiveView('challenges')}
                        >
                            View All
                            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </Button>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    {loading ? (
                        // Loading skeleton for recent challenges
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center p-4 animate-pulse">
                                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl mr-4"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                    </div>
                                    <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    ) : recentChallenges.length > 0 ? (
                        <div className="space-y-3">
                            {recentChallenges.map((challenge) => (
                                <RecentChallengeItem 
                                    key={challenge.id} 
                                    challenge={challenge} 
                                    onClick={() => setActiveView('do-challenge', challenge.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Trophy className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No active challenges</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">Start your innovation journey by joining a challenge</p>
                            <Button 
                                onClick={() => setActiveView('challenges')}
                                className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                            >
                                Browse Challenges
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Component for Recent Challenge List Item
function RecentChallengeItem({ challenge, onClick }) {
    return (
        <div 
            className="group flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600/50"
            onClick={onClick}
        >
            <div className="w-12 h-12 rounded-xl overflow-hidden mr-4 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <img 
                    src={challenge.image}
                    alt={challenge.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        img.src = "/placeholder-challenge.jpg";
                    }}
                />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-200">{challenge.title}</h3>
                    <Badge 
                        variant="outline" 
                        className={`ml-2 flex-shrink-0 text-xs ${
                            challenge.daysLeft > 0 
                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/20' 
                                : 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-900/20'
                        }`}
                    >
                        {challenge.daysLeft > 0 ? `${challenge.daysLeft} days left` : 'Ended'}
                    </Badge>
                </div>
                
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-300 mb-3">
                    <span className="truncate font-medium">{challenge.organization}</span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                        <span className="font-medium">{challenge.progress}% complete</span>
                    </div>
                </div>
                
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-300">
                        <span>Progress</span>
                        <span>{challenge.progress}%</span>
                    </div>
                    <Progress 
                        value={challenge.progress} 
                        className="h-2 bg-slate-200 dark:bg-slate-700" 
                    />
                </div>
            </div>
        </div>
    );
}