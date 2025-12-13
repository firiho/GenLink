import { Link } from 'react-router-dom';
import { Users, HelpCircle, Folder, Code, ArrowRight, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickLink {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  color: string;
  bgColor: string;
}

const quickLinks: QuickLink[] = [
  {
    label: 'Community',
    href: '/community',
    icon: Users,
    description: 'Connect with other participants',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    label: 'Help Center',
    href: '/help',
    icon: HelpCircle,
    description: 'Get support and answers',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    label: 'Projects',
    href: '#',
    icon: Folder,
    description: 'View your projects',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    label: 'Challenges',
    href: '#',
    icon: Code,
    description: 'Browse your challenges',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    label: 'Teams',
    href: '#',
    icon: UserPlus,
    description: 'Manage your teams',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  }
];

interface QuickLinksProps {
  setActiveView?: (view: string, data?: string) => void;
}

export default function QuickLinks({ setActiveView }: QuickLinksProps) {
  const handleLinkClick = (link: QuickLink) => {
    if (link.href === '/community' || link.href === '/help') {
      // External routes - handled by Link component
      return;
    }
    
    // Internal dashboard routes
    if (setActiveView) {
      if (link.href === '#') {
        const viewMap: Record<string, string> = {
          'Projects': 'projects',
          'Challenges': 'challenges',
          'Teams': 'teams'
        };
        const view = viewMap[link.label];
        if (view) {
          setActiveView(view);
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Quick Links</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Navigate to key sections</p>
      </div>

      <div className="p-4 sm:p-6 space-y-2">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          const isExternalRoute = link.href.startsWith('/') && link.href !== '#';
          
          const linkContent = (
            <div
              className={cn(
                "group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
                "hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-transform duration-200 group-hover:scale-110",
                link.bgColor
              )}>
                <Icon className={cn("h-5 w-5", link.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">
                  {link.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {link.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors group-hover:translate-x-0.5 transition-transform" />
            </div>
          );

          if (isExternalRoute) {
            return (
              <Link key={link.label} to={link.href}>
                {linkContent}
              </Link>
            );
          }

          return (
            <div
              key={link.label}
              onClick={() => handleLinkClick(link)}
            >
              {linkContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

