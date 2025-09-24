import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { 
  LogOut, 
  Settings,
  Leaf,
  Flame,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              EcoLearn
            </span>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {/* Points & Streak (Student only) */}
            {user?.role === 'student' && (
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline" className="border-yellow-400/20 text-yellow-400">
                  <Trophy className="w-3 h-3 mr-1" />
                  {user.points}
                </Badge>
                <Badge variant="outline" className="border-orange-400/20 text-orange-400">
                  <Flame className="w-3 h-3 mr-1" />
                  {user.streak}d
                </Badge>
              </div>
            )}

            {/* Notifications */}
            <NotificationDropdown />

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>

            {/* User Avatar & Logout */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground hidden sm:block">
                {user?.avatar} {user?.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};