import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Camera, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface QuestSubmissionModalProps {
  questId: string;
  questTitle: string;
  questPoints: number;
  onSubmissionCreated?: () => void;
}

export const QuestSubmissionModal: React.FC<QuestSubmissionModalProps> = ({
  questId,
  questTitle,
  questPoints,
  onSubmissionCreated
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    description: '',
    proof_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('eco_quest_submissions')
        .insert({
          user_id: user.id,
          eco_quest_id: questId,
          description: formData.description,
          proof_url: formData.proof_url,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Submission Created!',
        description: `Your submission for "${questTitle}" has been sent for review.`,
      });

      setFormData({
        description: '',
        proof_url: ''
      });
      
      setOpen(false);
      onSubmissionCreated?.();
      
    } catch (error) {
      console.error('Error creating submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to create submission. Please try again.',
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
          <Camera className="w-4 h-4 mr-2" />
          Submit Quest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Submit Quest: {questTitle}
          </DialogTitle>
          <DialogDescription>
            Submit your proof of completion to earn {questPoints} points.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description of Work</Label>
            <Textarea
              id="description"
              placeholder="Describe what you did for this quest..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="proof_url">Proof URL (Optional)</Label>
            <Input
              id="proof_url"
              placeholder="https://... (link to photos, documents, etc.)"
              value={formData.proof_url}
              onChange={(e) => setFormData(prev => ({ ...prev, proof_url: e.target.value }))}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-button">
              {loading ? 'Submitting...' : 'Submit Quest'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};