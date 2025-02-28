import { Search, Plus, Users } from 'lucide-react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { motion } from 'framer-motion';

export default function TeamsTab() {

    const teams = [
        {
          id: '1',
          name: 'Innovation Squad',
          members: 5,
          activeChallenges: 3,
          completedChallenges: 8,
        },
        {
          id: '2',
          name: 'Tech Pioneers',
          members: 4,
          activeChallenges: 2,
          completedChallenges: 5,
        },
        {
          id: '3',
          name: 'Digital Transformers',
          members: 6,
          activeChallenges: 4,
          completedChallenges: 10,
        }
      ];
      
  return (
    <div className="space-y-4 sm:space-y-6 mt-5">
        <div className="flex flex-col space-y-4">
            <WelcomeSection title="Your Teams" subtitle="Manage and track your innovation teams" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                placeholder="Search teams..."
                className="pl-9 py-2 text-sm w-full"
                />
            </div>
            <Button 
                size="sm"
                className="bg-primary text-white rounded-lg hover:bg-primary/90 w-full sm:w-auto"
            >
                <Plus className="h-4 w-4 mr-1.5" />
                Create New Team
            </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((team) => (
            <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
            >
                <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg truncate">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.members} members</p>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                        <p className="text-xs text-gray-500">Active Challenges</p>
                        <p className="font-medium">{team.activeChallenges}</p>
                        </div>
                        <div>
                        <p className="text-xs text-gray-500">Completed</p>
                        <p className="font-medium">{team.completedChallenges}</p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </motion.div>
            ))}
        </div>
    </div>
  )
}
