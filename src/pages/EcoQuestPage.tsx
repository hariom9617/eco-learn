import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Camera, MapPin, Users, Clock, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QuestSubmissionModal } from '@/components/quests/QuestSubmissionModal';
import { toast } from '@/hooks/use-toast';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'bg-success/20 text-success border-success/30';
    case 'Medium': return 'bg-warning/20 text-warning border-warning/30';
    case 'Hard': return 'bg-destructive/20 text-destructive border-destructive/30';
    default: return 'bg-muted/20 text-muted-foreground border-muted/30';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-primary/20 text-primary border-primary/30';
    case 'completed': return 'bg-success/20 text-success border-success/30';
    case 'pending': return 'bg-muted/20 text-muted-foreground border-muted/30';
    default: return 'bg-muted/20 text-muted-foreground border-muted/30';
  }
};

export const EcoQuestPage: React.FC = () => {
  const { user } = useAuth();
  const [ecoQuests, setEcoQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubmissions, setUserSubmissions] = useState({});

  // Fetch eco quests and user submissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active eco quests
        const { data: questsData, error: questsError } = await supabase
          .from('eco_quests')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (questsError) throw questsError;

        // Fetch user submissions if user is a student
        if (user?.role === 'student') {
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('eco_quest_submissions')
            .select('eco_quest_id, status')
            .eq('user_id', user.id);

          if (submissionsError) throw submissionsError;

          // Create a map of quest submissions
          const submissionsMap = {};
          submissionsData?.forEach(sub => {
            submissionsMap[sub.eco_quest_id] = sub.status;
          });
          setUserSubmissions(submissionsMap);
        }

        setEcoQuests(questsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load eco quests. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getQuestStatus = (questId: string) => {
    const submission = userSubmissions[questId];
    if (submission === 'approved') return 'completed';
    if (submission === 'pending') return 'pending';
    if (submission === 'rejected') return 'active';
    return 'active';
  };
  return (
    <div className="min-h-screen bg-background pt-20 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Eco-Quests</h1>
          <p className="text-muted-foreground">Complete real-world environmental challenges</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : ecoQuests.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Eco-Quests Available</h2>
            <p className="text-muted-foreground">Check back later for new environmental challenges!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {ecoQuests.map((quest) => {
              const status = user?.role === 'student' ? getQuestStatus(quest.id) : 'active';
              
              return (
                <Card key={quest.id} className="group hover:shadow-elevated transition-all duration-300 border-border/50 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDifficultyColor(quest.difficulty)}>
                            {quest.difficulty}
                          </Badge>
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                          <Badge variant="outline" className="text-warning border-warning/30">
                            <Trophy className="w-3 h-3 mr-1" />
                            {quest.points_reward} pts
                          </Badge>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors mb-2">
                          {quest.title}
                        </CardTitle>
                        <CardDescription>
                          {quest.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Quest Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Active
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Open to all
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {quest.difficulty} level
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        {user?.role === 'student' && (
                          <>
                            {status === 'active' && (
                              <QuestSubmissionModal
                                questId={quest.id}
                                questTitle={quest.title}
                                questPoints={quest.points_reward}
                                onSubmissionCreated={() => window.location.reload()}
                              />
                            )}
                            {status === 'pending' && (
                              <Button variant="outline" disabled className="w-full sm:w-auto">
                                <Clock className="w-4 h-4 mr-2" />
                                Pending Review
                              </Button>
                            )}
                            {status === 'completed' && (
                              <Button variant="outline" disabled className="w-full sm:w-auto">
                                <Trophy className="w-4 h-4 mr-2" />
                                Completed
                              </Button>
                            )}
                          </>
                        )}
                        {user?.role === 'teacher' && (
                          <Button variant="outline" className="w-full sm:w-auto">
                            <Users className="w-4 h-4 mr-2" />
                            View Submissions
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};