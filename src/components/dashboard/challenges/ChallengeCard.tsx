import { useNavigate } from 'react-router-dom';
import { Clock, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ChallengeCard({ challenge, index, setActiveTab, viewMode = 'list' }) {
  const navigate = useNavigate();
  
  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'submitted': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };
  
  const statusColor = getStatusColor(challenge.status);
  
  if (viewMode === 'grid') {
    return (
      <div className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Challenge image */}
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={challenge.image} 
            alt={challenge.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              imgElement.onerror = null;
              imgElement.src = "/placeholder-challenge.jpg";
            }}
          />
        </div>
        
        {/* Challenge details */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 flex-1 mr-2">{challenge.title}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor} flex-shrink-0`}>
              {challenge.status === 'in-progress' ? 'In Progress' : 
               challenge.status === 'submitted' ? 'Submitted' :
               challenge.status === 'completed' ? 'Completed' : challenge.status}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-1">{challenge.organization}</p>
          
          {/* Challenge stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <Trophy className="h-3.5 w-3.5 mr-2" />
              <span className="truncate">{challenge.prize}</span>
            </div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <Users className="h-3.5 w-3.5 mr-2" />
              <span>{challenge.participants} Participants</span>
            </div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5 mr-2" />
              <span>
                {challenge.daysLeft > 0 
                  ? `${challenge.daysLeft} days left` 
                  : 'Deadline passed'}
              </span>
            </div>
          </div>
          
          {/* Action button */}
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => setActiveTab('do-challenge',  challenge.id)}
          >
            View Challenge
          </Button>
        </div>
      </div>
    );
  }

  // List view (default)
  return (
      <div className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Challenge image */}
        <div className="w-full md:w-48 h-36 md:h-auto overflow-hidden">
          <img 
            src={challenge.image} 
            alt={challenge.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              imgElement.onerror = null;
              imgElement.src = "/placeholder-challenge.jpg";
            }}
          />
        </div>
        
        {/* Challenge details */}
        <div className="p-6 flex-grow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mr-2">{challenge.title}</h3>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor} mt-1 md:mt-0`}>
              {challenge.status === 'in-progress' ? 'In Progress' : 
               challenge.status === 'submitted' ? 'Submitted' :
               challenge.status === 'completed' ? 'Completed' : challenge.status}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{challenge.organization}</p>
          
          {/* Challenge stats */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <Trophy className="h-3.5 w-3.5 mr-1.5" />
              <span>{challenge.prize}</span>
            </div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              <span>{challenge.participants} Participants</span>
            </div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              <span>
                {challenge.daysLeft > 0 
                  ? `${challenge.daysLeft} days left` 
                  : 'Deadline passed'}
              </span>
            </div>
          </div>
          
          {/* Action button */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setActiveTab('do-challenge',  challenge.id)}
            >
              View Challenge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}