import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Target, 
  Trophy, 
  User,
  BarChart3,
  Users,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const studentNavItems = [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'courses', label: 'Courses', icon: BookOpen, path: '/courses' },
    { id: 'quests', label: 'Eco-Quests', icon: Target, path: '/eco-quests' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/teacher/dashboard' },
    { id: 'students', label: 'Students', icon: Users, path: '/teacher/students' },
    { id: 'courses', label: 'Courses', icon: BookOpen, path: '/teacher/courses' },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare, path: '/teacher/approvals' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/teacher/analytics' }
  ];

  const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems;

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center justify-center p-2 min-w-[60px] transition-all duration-200 ${
                  isActive 
                    ? 'text-primary scale-110' 
                    : 'text-muted-foreground hover:text-foreground hover:scale-105'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'animate-bounce-subtle' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-1 animate-pulse-ring" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};