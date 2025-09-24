import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CreateQuestModalProps {
  onQuestCreated?: () => void;
}

export const CreateQuestModal: React.FC<CreateQuestModalProps> = ({ onQuestCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    points_reward: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Create the quest
      const { data: quest, error: questError } = await supabase
        .from('eco_quests')
        .insert({
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
          points_reward: formData.points_reward,
          created_by: user.id
        })
        .select()
        .single();

      if (questError) throw questError;

      // Create notifications for all students
      const { data: students } = await supabase
        .from('profiles')
        .select('user_id');

      if (students) {
        const notifications = students.map(student => ({
          user_id: student.user_id,
          title: 'New Eco-Quest Available!',
          message: `${formData.title} - ${formData.points_reward} points available`,
          type: 'quest',
          data: { quest_id: quest.id }
        }));

        await supabase
          .from('notifications')
          .insert(notifications);
      }

      toast({
        title: 'Quest Created!',
        description: `${formData.title} has been published successfully and students have been notified.`,
      });

      setFormData({
        title: '',
        description: '',
        difficulty: '',
        points_reward: 50
      });
      
      setOpen(false);
      onQuestCreated?.();
      
    } catch (error) {
      console.error('Error creating quest:', error);
      toast({
        title: 'Error',
        description: 'Failed to create quest. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-button hover:shadow-glow-primary transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Create Quest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Create New Eco-Quest
          </DialogTitle>
          <DialogDescription>
            Create an environmental challenge for your students to complete.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quest Title</Label>
            <Input
              id="title"
              placeholder="e.g., Campus Green Survey"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what students need to do..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points">Points Reward</Label>
              <Input
                id="points"
                type="number"
                min="10"
                max="1000"
                step="10"
                value={formData.points_reward}
                onChange={(e) => setFormData(prev => ({ ...prev, points_reward: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-button">
              {loading ? 'Creating...' : 'Create Quest'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};