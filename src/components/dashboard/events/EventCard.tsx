import { Calendar, Clock, MapPin, Users, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/event';

export default function EventCard({ event, index, setActiveView, viewMode = 'list' }: { 
  event: Event; 
  index: number; 
  setActiveView: (view: string, data?: any) => void;
  viewMode?: 'list' | 'grid';
}) {
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'In-Person': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Online': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Hybrid': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };
  
  const typeColor = getTypeColor(event.type);
  
  if (viewMode === 'grid') {
    return (
      <div className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {event.thumbnail && (
          <div className="h-48 w-full overflow-hidden">
            <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 flex-1 mr-2">{event.title}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColor} flex-shrink-0`}>
              {event.type}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{event.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5 mr-2" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5 mr-2" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 mr-2" />
              <span className="truncate">{event.location}</span>
            </div>
            {event.maxAttendees && (
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                <Users className="h-3.5 w-3.5 mr-2" />
                <span>{event.attendees}/{event.maxAttendees} attendees</span>
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => setActiveView('event', event.id)}
          >
            View Event
          </Button>
        </div>
      </div>
    );
  }

  // List view - Table-like
  return (
    <div 
      className="group border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer last:border-b-0"
      onClick={() => setActiveView('event', event.id)}
    >
      <div className="px-4 py-3 flex items-center gap-4">
        {event.thumbnail && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{event.title}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeColor} flex-shrink-0`}>
              {event.type}
            </span>
            {event.visibility === 'unlisted' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Unlisted
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {event.time}
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
            {event.maxAttendees && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.attendees}/{event.maxAttendees}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

