import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp, Users, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  streak: number;
  avatar: string;
  level: string;
  rank: number;
  role: string;
}

// Mock teams data - will be replaced when teams functionality is implemented
const teams = [
  { id: 1, name: 'Green Guardians', members: 12, points: 18750, avatar: '🌿', rank: 1 },
  { id: 2, name: 'Eco Warriors', members: 8, points: 16420, avatar: '⚡', rank: 2 },
  { id: 3, name: 'Planet Protectors', members: 15, points: 15890, avatar: '🌍', rank: 3 },
  { id: 4, name: 'Climate Champions', members: 10, points: 14230, avatar: '🌡️', rank: 4 }
];

const getLevelFromPoints = (points: number): string => {
  if (points >= 4000) return 'Eco Master';
  if (points >= 3500) return 'Green Guardian';
  if (points >= 3000) return 'Earth Advocate';
  if (points >= 2500) return 'Climate Champion';
  if (points >= 2000) return 'Sustainability Star';
  if (points >= 1500) return 'Eco Learner';
  if (points >= 1000) return 'Green Beginner';
  return 'Eco Newcomer';
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
    case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
    case 3: return <Medal className="w-5 h-5 text-amber-600" />;
    default: return <Award className="w-5 h-5 text-muted-foreground" />;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1: return 'bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/20';
    case 2: return 'bg-gradient-to-r from-gray-400/10 to-gray-600/10 border-gray-400/20';
    case 3: return 'bg-gradient-to-r from-amber-400/10 to-amber-600/10 border-amber-400/20';
    default: return 'bg-card border-border/50';
  }
};

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [topLearners, setTopLearners] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();

    // Set up real-time subscription for leaderboard updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          // Refetch leaderboard data when profiles change
          fetchLeaderboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, points, streak, avatar_url')
        .order('points', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        return;
      }

      const leaderboardUsers: LeaderboardUser[] = profiles.map((profile, index) => ({
        id: profile.user_id,
        name: profile.display_name,
        points: profile.points,
        streak: profile.streak,
        avatar: profile.avatar_url || '👨‍🎓',
        level: getLevelFromPoints(profile.points),
        rank: index + 1,
        role: 'student'
      }));

      setTopLearners(leaderboardUsers);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank among eco-learners</p>
        </div>

        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Teams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading leaderboard...</span>
              </div>
            ) : topLearners.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No users found. Sign up some students to see the leaderboard!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Top 3 Highlight */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {topLearners.slice(0, 3).map((learner) => (
                <Card 
                  key={learner.id} 
                  className={`text-center ${getRankBg(learner.rank)} hover:shadow-elevated transition-all duration-300`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-center mb-2">
                      {getRankIcon(learner.rank)}
                    </div>
                    <div className="text-2xl">{learner.avatar}</div>
                    <CardTitle className="text-lg">{learner.name}</CardTitle>
                    <Badge variant="outline" className="mx-auto">
                      {learner.level}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">
                        {learner.points.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {learner.streak} day streak
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Rankings */}
            <Card>
              <CardHeader>
                <CardTitle>All Rankings</CardTitle>
                <CardDescription>Complete leaderboard rankings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLearners.map((learner) => (
                    <div 
                      key={learner.id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
                        user?.id === learner.id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8">
                        {learner.rank <= 3 ? getRankIcon(learner.rank) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            {learner.rank}
                          </span>
                        )}
                      </div>
                      
                      <Avatar>
                        <AvatarFallback className="text-lg">
                          {learner.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {learner.name}
                          {user?.id === learner.id && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {learner.level}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {learner.points.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {learner.streak}d streak
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Rankings</CardTitle>
                <CardDescription>Top performing eco-learning teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div 
                      key={team.id}
                      className={`flex items-center gap-4 p-4 rounded-lg ${getRankBg(team.rank)} hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(team.rank)}
                      </div>
                      
                      <div className="text-2xl">{team.avatar}</div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-lg">
                          {team.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {team.members} members
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-primary text-lg">
                          {team.points.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          team points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};