import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ThemeSwitcherProps {
  simpleToggle?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ simpleToggle = false }) => {
  const { theme, setTheme, actualTheme } = useTheme();

  const themes = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
      description: 'Light mode'
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: Moon,
      description: 'Dark mode'
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: Monitor,
      description: 'Follow system'
    }
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  // Simple toggle functionality
  const handleToggle = () => {
    const currentIndex = themes.findIndex(t => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  // If simple toggle mode, return a simple button
  if (simpleToggle) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="h-9 w-9 p-0 rounded-lg border border-border hover:bg-accent/5 transition-all duration-200"
        title={`Current: ${currentTheme.label}. Click to cycle themes.`}
      >
        <div
          key={theme}
        >
          <CurrentIcon className="h-4 w-4" />
        </div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg border border-border hover:bg-accent/5 transition-all duration-200"
        >
          <div
            key={theme}
          >
            <CurrentIcon className="h-4 w-4" />
          </div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 p-2 bg-card/95 backdrop-blur-xl border border-border shadow-modern"
      >
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isActive = theme === themeOption.value;
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
              }`}
            >
              <div>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{themeOption.label}</span>
                <span className="text-xs text-muted-foreground">{themeOption.description}</span>
              </div>
              {isActive && (
                <div
                  className="ml-auto w-2 h-2 rounded-full bg-accent"
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
