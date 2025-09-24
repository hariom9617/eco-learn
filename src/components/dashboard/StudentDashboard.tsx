import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, 
  Trophy, 
  Flame, 
  Target, 
  BookOpen, 
  Users, 
  Calendar,
  TrendingUp,
  Star,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const todayTask = {
    title: "Plant a Virtual Tree",
    description: "Complete the Forest Conservation quiz",
    points: 50,
    progress: 75
  };

  const quickStats = [
    { label: "Total Points", value: user?.points || 0, icon: Trophy, color: "text-yellow-400" },
    { label: "Current Streak", value: `${user?.streak || 0} days`, icon: Flame, color: "text-orange-400" },
    { label: "Rank", value: "#3", icon: Award, color: "text-purple-400" },
    { label: "Completed", value: "12 courses", icon: BookOpen, color: "text-blue-400" }
  ];

  const recentCourses = [
    { title: "Climate Change Basics", progress: 85, color: "bg-green-500" },
    { title: "Renewable Energy", progress: 60, color: "bg-blue-500" },
    { title: "Ocean Conservation", progress: 40, color: "bg-cyan-500" }
  ];

  const leaderboardPreview = [
    { name: "Emma Green", points: 3200, rank: 1 },
    { name: "Marcus Wind", points: 2950, rank: 2 },
    { name: user?.name || "You", points: user?.points || 0, rank: 3 }
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.avatar} {user?.name}!
          </h1>
          <p className="text-muted-foreground">Ready to continue your eco-learning journey?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-scale-in">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-border shadow-card hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Task */}
        <Card className="bg-gradient-card border-border shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Today's Eco-Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{todayTask.title}</h3>
                <p className="text-muted-foreground text-sm">{todayTask.description}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary">
                  <Star className="w-4 h-4" />
                  <span className="font-bold">+{todayTask.points}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium">{todayTask.progress}%</span>
              </div>
              <Progress value={todayTask.progress} className="h-2" />
            </div>
            <Button className="w-full bg-gradient-button hover:shadow-glow-primary transition-all duration-300">
              Continue Challenge
            </Button>
          </CardContent>
        </Card>

        {/* Course Progress & Leaderboard */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Courses */}
          <Card className="bg-gradient-card border-border shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" />
                Course Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCourses.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-medium text-sm">{course.title}</span>
                    <span className="text-muted-foreground text-xs">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/courses')}>
                View All Courses
              </Button>
            </CardContent>
          </Card>

          {/* Leaderboard Preview */}
          <Card className="bg-gradient-card border-border shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboardPreview.map((player, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.name === user?.name ? 'bg-primary/10 border border-primary/20' : 'bg-muted/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      'bg-orange-500 text-black'
                    }`}>
                      {player.rank}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.points} points</p>
                    </div>
                  </div>
                  {player.name === user?.name && (
                    <span className="text-primary text-xs font-medium">You</span>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/leaderboard')}>
                View Full Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-scale-in">
          <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow-primary transition-all duration-300 cursor-pointer" onClick={() => navigate('/courses')}>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <p className="text-sm font-medium text-foreground">Courses</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow-secondary transition-all duration-300 cursor-pointer" onClick={() => navigate('/eco-quests')}>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">Eco-Quests</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow-primary transition-all duration-300 cursor-pointer" onClick={() => navigate('/leaderboard')}>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-sm font-medium text-foreground">Community</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow-secondary transition-all duration-300 cursor-pointer" onClick={() => navigate('/profile')}>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-sm font-medium text-foreground">Schedule</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};