import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Trophy, 
  Flame, 
  BookOpen, 
  Target, 
  Award,
  Calendar,
  TrendingUp,
  Settings,
  Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const achievements = [
  { id: 1, title: 'First Steps', description: 'Complete your first course', icon: '🌱', unlocked: true },
  { id: 2, title: 'Streak Master', description: '7-day learning streak', icon: '🔥', unlocked: true },
  { id: 3, title: 'Quiz Champion', description: 'Score 100% on 5 quizzes', icon: '🏆', unlocked: true },
  { id: 4, title: 'Eco Warrior', description: 'Complete 10 eco-quests', icon: '⚔️', unlocked: false },
  { id: 5, title: 'Team Player', description: 'Join a study group', icon: '👥', unlocked: false },
  { id: 6, title: 'Knowledge Seeker', description: 'Complete 5 courses', icon: '📚', unlocked: false }
];

const recentActivity = [
  { id: 1, type: 'course', title: 'Completed "Climate Change Fundamentals"', date: '2 hours ago', points: 150 },
  { id: 2, type: 'quiz', title: 'Scored 95% on Renewable Energy Quiz', date: '1 day ago', points: 100 },
  { id: 3, type: 'quest', title: 'Submitted Campus Green Survey', date: '2 days ago', points: 250 },
  { id: 4, type: 'streak', title: 'Maintained 7-day learning streak', date: '3 days ago', points: 50 }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'course': return <BookOpen className="w-4 h-4 text-blue-400" />;
    case 'quiz': return <Trophy className="w-4 h-4 text-yellow-400" />;
    case 'quest': return <Target className="w-4 h-4 text-green-400" />;
    case 'streak': return <Flame className="w-4 h-4 text-orange-400" />;
    default: return <Award className="w-4 h-4 text-gray-400" />;
  }
};

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const nextLevelPoints = 3000;
  const progressToNextLevel = ((user?.points || 0) / nextLevelPoints) * 100;

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary/10">
                  {user?.avatar}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {user?.role === 'student' ? '🎓 Student' : '👩‍🏫 Teacher'}
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
                
                <p className="text-muted-foreground mb-4">{user?.email}</p>
                
                {user?.role === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="font-bold text-foreground">{user.points}</div>
                        <div className="text-sm text-muted-foreground">Points</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-400" />
                      <div>
                        <div className="font-bold text-foreground">{user.streak}</div>
                        <div className="text-sm text-muted-foreground">Day Streak</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-bold text-foreground">#6</div>
                        <div className="text-sm text-muted-foreground">Rank</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              
            </div>
          </CardContent>
        </Card>

        {user?.role === 'student' && (
          <>
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Level Progress
                </CardTitle>
                <CardDescription>
                  {nextLevelPoints - (user?.points || 0)} points to next level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Eco Learner</span>
                    <span>Next: Green Guardian</span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{user?.points} points</span>
                    <span>{nextLevelPoints} points</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        achievement.unlocked 
                          ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                          : 'bg-muted/10 border-muted/20 opacity-60'
                      }`}
                    >
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <div className={`font-medium mb-1 ${
                        achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {achievement.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {achievement.description}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest learning achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{activity.title}</div>
                        <div className="text-sm text-muted-foreground">{activity.date}</div>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary/30">
                        +{activity.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Notification Preferences
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Trophy className="w-4 h-4 mr-2" />
                Privacy Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
