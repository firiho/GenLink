import { Clock, FolderOpen, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProjectCard({ project, index, setActiveView, viewMode = 'list' }) {
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'submitted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };
  
  const statusColor = getStatusColor(project.status);
  
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (viewMode === 'grid') {
    return (
      <div className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 flex-1 mr-2">{project.title}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor} flex-shrink-0`}>
              {project.status === 'in-progress' ? 'In Progress' : 
               project.status === 'submitted' ? 'Submitted' :
               project.status === 'draft' ? 'Draft' : project.status}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{project.description}</p>
          
          {project.challengeTitle && (
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mb-3">
              <FolderOpen className="h-3.5 w-3.5 mr-2" />
              <span className="truncate">{project.challengeTitle}</span>
            </div>
          )}
          
          {project.teamId && (
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mb-3">
              <Users className="h-3.5 w-3.5 mr-2" />
              <span>Team Project</span>
            </div>
          )}
          
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mb-4">
            <Clock className="h-3.5 w-3.5 mr-2" />
            <span>Updated {formatDate(project.updatedAt)}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => setActiveView('project', project.id)}
          >
            View Project
          </Button>
        </div>
      </div>
    );
  }

  // List view - Table-like
  return (
    <div 
      className="group border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer last:border-b-0"
      onClick={() => setActiveView('project', project.id)}
    >
      <div className="px-4 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{project.title}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor} flex-shrink-0`}>
              {project.status === 'in-progress' ? 'In Progress' : 
               project.status === 'submitted' ? 'Submitted' :
               project.status === 'draft' ? 'Draft' : project.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {project.challengeTitle && (
              <span className="truncate flex items-center gap-1">
                <FolderOpen className="h-3 w-3" />
                {project.challengeTitle}
              </span>
            )}
            {project.teamId && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Team
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

