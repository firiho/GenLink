import { useNavigate } from 'react-router-dom';
import { Clock, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ChallengeCard({ challenge, index , setActiveTab}) {
  const navigate = useNavigate();
  
  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const statusColor = getStatusColor(challenge.status);
  
  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col md:flex-row">
        {/* Challenge image */}
        <div className="w-full md:w-48 h-36 md:h-auto overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
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
        <div className="p-4 flex-grow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mr-2">{challenge.title}</h3>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${statusColor} mt-1 md:mt-0`}>
              {challenge.status === 'in-progress' ? 'In Progress' : 
               challenge.status === 'submitted' ? 'Submitted' :
               challenge.status === 'completed' ? 'Completed' : challenge.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mb-3">{challenge.organization}</p>
          
          {/* Challenge stats */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
            <div className="flex items-center text-xs text-gray-600">
              <Trophy className="h-3.5 w-3.5 mr-1" />
              <span>{challenge.prize}</span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <Users className="h-3.5 w-3.5 mr-1" />
              <span>{challenge.participants} Participants</span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <Clock className="h-3.5 w-3.5 mr-1" />
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