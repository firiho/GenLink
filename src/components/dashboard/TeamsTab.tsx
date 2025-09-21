import { Search, Plus, Users, Trophy, Target, ArrowRight, Filter, Grid, List, Settings, UserPlus, Crown, Calendar, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function TeamsTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('my-teams');

    const teams = [
        {
          id: '1',
          name: 'Innovation Squad',
          memberCount: 5,
          maxMembers: 8,
          activeChallenges: 3,
          completedChallenges: 8,
          status: 'active',
          description: 'Leading the charge in breakthrough innovations',
          role: 'owner',
          avatar: '/placeholder-team-1.jpg',
          skills: ['React', 'Node.js', 'AI/ML', 'Design'],
          lastActivity: '2 hours ago',
          members: [
            { id: '1', name: 'Alex Chen', role: 'owner', avatar: '/placeholder-user-1.jpg' },
            { id: '2', name: 'Sarah Johnson', role: 'member', avatar: '/placeholder-user-2.jpg' },
            { id: '3', name: 'Mike Rodriguez', role: 'member', avatar: '/placeholder-user-3.jpg' },
            { id: '4', name: 'Emma Wilson', role: 'member', avatar: '/placeholder-user-4.jpg' },
            { id: '5', name: 'David Kim', role: 'member', avatar: '/placeholder-user-5.jpg' }
          ]
        },
        {
          id: '2',
          name: 'Tech Pioneers',
          memberCount: 4,
          maxMembers: 6,
          activeChallenges: 2,
          completedChallenges: 5,
          status: 'active',
          description: 'Pushing the boundaries of technology',
          role: 'member',
          avatar: '/placeholder-team-2.jpg',
          skills: ['Python', 'Blockchain', 'DevOps', 'Security'],
          lastActivity: '1 day ago',
          members: [
            { id: '6', name: 'Lisa Zhang', role: 'owner', avatar: '/placeholder-user-6.jpg' },
            { id: '7', name: 'You', role: 'member', avatar: '/placeholder-user-7.jpg' },
            { id: '8', name: 'Tom Anderson', role: 'member', avatar: '/placeholder-user-8.jpg' },
            { id: '9', name: 'Nina Patel', role: 'member', avatar: '/placeholder-user-9.jpg' }
          ]
        },
        {
          id: '3',
          name: 'Digital Transformers',
          memberCount: 6,
          maxMembers: 10,
          activeChallenges: 4,
          completedChallenges: 10,
          status: 'active',
          description: 'Transforming ideas into digital solutions',
          role: 'admin',
          avatar: '/placeholder-team-3.jpg',
          skills: ['Full-stack', 'Mobile', 'Cloud', 'Data Science'],
          lastActivity: '3 hours ago',
          members: [
            { id: '10', name: 'James Wilson', role: 'owner', avatar: '/placeholder-user-10.jpg' },
            { id: '11', name: 'You', role: 'admin', avatar: '/placeholder-user-11.jpg' },
            { id: '12', name: 'Rachel Green', role: 'member', avatar: '/placeholder-user-12.jpg' },
            { id: '13', name: 'Chris Brown', role: 'member', avatar: '/placeholder-user-13.jpg' },
            { id: '14', name: 'Amy Lee', role: 'member', avatar: '/placeholder-user-14.jpg' },
            { id: '15', name: 'Kevin Park', role: 'member', avatar: '/placeholder-user-15.jpg' }
          ]
        }
      ];
      
  return (
    <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col space-y-6">
            <WelcomeSection title="Team Collaboration" subtitle="Build, manage, and collaborate with teams on innovation challenges" />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col gap-4 mb-6">
                    <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
                        <TabsTrigger 
                            value="my-teams" 
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg flex-1 sm:flex-none"
                        >
                            My Teams
                        </TabsTrigger>
                        <TabsTrigger 
                            value="discover" 
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg flex-1 sm:flex-none"
                        >
                            Discover
                        </TabsTrigger>
                        <TabsTrigger 
                            value="invitations" 
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg flex-1 sm:flex-none"
                        >
                            Invitations
                        </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-24 sm:w-32 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <SelectItem value="all" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">All</SelectItem>
                                    <SelectItem value="active" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Active</SelectItem>
                                    <SelectItem value="archived" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
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
                            <Button 
                                className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Create Team</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <TabsContent value="my-teams" className="space-y-6">
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}>
                        {teams.map((team, index) => (
                            <motion.div
                                key={team.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-slate-200 dark:border-slate-600">
                                            <Users className="h-7 w-7 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{team.name}</h3>
                                                {team.role === 'owner' && <Crown className="h-4 w-4 text-amber-500" />}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{team.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                <Calendar className="h-3 w-3" />
                                                <span>Last active {team.lastActivity}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge 
                                            variant="outline" 
                                            className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/20"
                                        >
                                            {team.status}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {team.role}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Member Avatars */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center -space-x-2">
                                            {team.members.slice(0, 4).map((member, memberIndex) => (
                                                <div key={member.id} className="relative">
                                                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        {member.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    {member.role === 'owner' && (
                                                        <Crown className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
                                                    )}
                                                </div>
                                            ))}
                                            {team.members.length > 4 && (
                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    +{team.members.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <Users className="h-4 w-4 mr-1" />
                                            <span>{team.members.length}/{team.maxMembers}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-1">
                                        {team.skills.slice(0, 3).map((skill, skillIndex) => (
                                            <Badge key={skillIndex} variant="secondary" className="text-xs px-2 py-1">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {team.skills.length > 3 && (
                                            <Badge variant="secondary" className="text-xs px-2 py-1">
                                                +{team.skills.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                                        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                            <div className="flex items-center justify-center mb-1">
                                                <Target className="h-4 w-4 text-blue-500 mr-1" />
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Active</span>
                                            </div>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{team.activeChallenges}</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                            <div className="flex items-center justify-center mb-1">
                                                <Trophy className="h-4 w-4 text-emerald-500 mr-1" />
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Won</span>
                                            </div>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{team.completedChallenges}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="flex-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        >
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Chat
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="flex-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Manage
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="discover" className="space-y-6">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                            <Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Discover Teams</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">Find and join teams that match your skills and interests</p>
                        <Button className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Browse Teams
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="invitations" className="space-y-6">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                            <MessageSquare className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Team Invitations</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">You have no pending team invitations</p>
                        <Button variant="outline" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            View All Invitations
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    </div>
  )
}
