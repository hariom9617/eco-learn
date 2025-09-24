import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Target,
  Award,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateQuestModal } from '@/components/quests/CreateQuestModal';
import { supabase } from '@/integrations/supabase/client';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending quest submissions
  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('eco_quest_submissions')
        .select(`
          *,
          profiles!eco_quest_submissions_user_id_fkey (display_name),
          eco_quests (title, points_reward)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApproval = async (submissionId: string, status: 'approved' | 'rejected', pointsEarned: number) => {
    try {
      const { error } = await supabase
        .from('eco_quest_submissions')
        .update({ 
          status,
          points_earned: status === 'approved' ? pointsEarned : 0,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
      
      // Refresh submissions
      fetchSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const pendingTasks = [
    { id: 1, student: "Alex Johnson", task: "Recycling Photo Challenge", submitted: "2 hours ago", type: "eco-quest" },
    { id: 2, student: "Emma Green", task: "Water Conservation Quiz", submitted: "4 hours ago", type: "quiz" },
    { id: 3, student: "Marcus Wind", task: "Plant Growth Documentation", submitted: "1 day ago", type: "eco-quest" }
  ];

  const stats = [
    { label: "Active Students", value: "28", icon: Users, color: "text-blue-400", change: "+3 this week" },
    { label: "Courses Created", value: "12", icon: BookOpen, color: "text-green-400", change: "+2 this month" },
    { label: "Tasks Approved", value: "156", icon: CheckCircle, color: "text-purple-400", change: "+12 today" },
    { label: "Avg. Completion", value: "85%", icon: TrendingUp, color: "text-yellow-400", change: "+5% vs last month" }
  ];

  const recentCourses = [
    { title: "Climate Change Fundamentals", students: 28, completion: 92, status: "active" },
    { title: "Renewable Energy Systems", students: 24, completion: 78, status: "active" },
    { title: "Ocean Conservation", students: 19, completion: 65, status: "draft" }
  ];

  const topStudents = [
    { name: "Emma Green", points: 3200, streak: 15, avatar: "👩‍🎓" },
    { name: "Alex Johnson", points: 2850, streak: 7, avatar: "👨‍🎓" },
    { name: "Marcus Wind", points: 2650, streak: 12, avatar: "🧑‍🎓" }
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Teacher Dashboard {user?.avatar}
          </h1>
          <p className="text-muted-foreground">Manage your courses and track student progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-scale-in">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-border shadow-card hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-xs text-green-400">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Approvals */}
        <Card className="bg-gradient-card border-border shadow-card animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Pending Approvals
              </CardTitle>
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-400">
                {pendingTasks.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No pending submissions
              </div>
            ) : (
              submissions.slice(0, 3).map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{submission.profiles?.display_name}</span>
                      <Badge variant="outline" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        eco-quest
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{submission.eco_quests?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-400 border-green-400/20"
                      onClick={() => handleApproval(submission.id, 'approved', submission.eco_quests?.points_reward || 50)}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-400 border-red-400/20"
                      onClick={() => handleApproval(submission.id, 'rejected', 0)}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            <Button className="w-full bg-gradient-button hover:shadow-glow-primary transition-all duration-300">
              View All Pending Tasks
            </Button>
          </CardContent>
        </Card>

        {/* Course Management & Top Students */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Course Management */}
          <Card className="bg-gradient-card border-border shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" />
                Course Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCourses.map((course, index) => (
                <div key={index} className="p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground text-sm">{course.title}</h4>
                    <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{course.students} students</span>
                    <span>{course.completion}% completion</span>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" size="sm">Create Course</Button>
                <Button variant="outline" size="sm">View Analytics</Button>
              </div>
            </CardContent>
          </Card>

          {/* Top Students */}
          <Card className="bg-gradient-card border-border shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Top Students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      'bg-orange-500 text-black'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {student.avatar} {student.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{student.points} pts</span>
                        <span>•</span>
                        <span>{student.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-scale-in">
          <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow-primary transition-all duration-300 cursor-pointer">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <p className="text-sm font-medium text-foreground">Create Course</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow-secondary transition-all duration-300 cursor-pointer">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">Analytics</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow-primary transition-all duration-300 cursor-pointer">
            <CardContent className="p-4 text-center">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-sm font-medium text-foreground">Student Progress</p>
            </CardContent>
          </Card>
          <CreateQuestModal />
        </div>
      </div>
    </div>
  );
};