import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck, Circle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PageTransition from '@/components/PageTransition';
import { useTrainingModules } from '@/hooks/useTrainingModules';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import cleaningSupplies from '@/assets/cleaning-supplies.jpg';

export default function Training() {
  const navigate = useNavigate();
  const { data: dbModules, isLoading } = useTrainingModules();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: progressData = [] } = useQuery({
    queryKey: ['my-training-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('training_progress').select('*').eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const completedIds = new Set(progressData.filter(p => p.completed).map(p => p.module_id));

  const toggleComplete = useMutation({
    mutationFn: async (moduleId: string) => {
      if (!user?.id) return;
      if (completedIds.has(moduleId)) {
        await supabase.from('training_progress').delete().eq('user_id', user.id).eq('module_id', moduleId);
      } else {
        await supabase.from('training_progress').insert({
          user_id: user.id, module_id: moduleId, completed: true, completed_at: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-training-progress'] });
      toast.success('Progress updated!');
    },
  });

  const modules = (dbModules || []).map(m => ({ ...m, completed: completedIds.has(m.id) }));
  const levels = [1, 2, 3];
  const levelProgress = (level: number) => {
    const lvl = modules.filter(m => m.level === level);
    const done = lvl.filter(m => m.completed).length;
    return lvl.length > 0 ? Math.round((done / lvl.length) * 100) : 0;
  };
  const totalCompleted = modules.filter(m => m.completed).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-5 pt-6 space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header with image */}
      <div className="relative h-48 overflow-hidden">
        <img src={cleaningSupplies} alt="Cleaning supplies" className="w-full h-full object-cover" loading="lazy" width={800} height={512} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 to-foreground/80" />
        <div className="absolute inset-0 px-5 pt-6 pb-4 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 text-white" strokeWidth={1.5} />
            </button>
            <span className="font-display font-bold text-white">Training Programme</span>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-3">Become a Five-Star Cleaner with Clean Fit</p>
            <div className="flex justify-between text-xs text-white/50 mb-1.5">
              <span>Overall Progress</span>
              <span>{totalCompleted}/{modules.length} modules</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: modules.length > 0 ? `${(totalCompleted / modules.length) * 100}%` : '0%' }}
                transition={{ duration: 0.5 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <PageTransition>
        <div className="px-5 py-6 space-y-6">
          {levels.map(level => {
            const lvlModules = modules.filter(m => m.level === level);
            if (lvlModules.length === 0) return null;
            const title = lvlModules[0]?.level_title || `Level ${level}`;
            const progress = levelProgress(level);

            return (
              <section key={level}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-bold text-foreground text-sm">Level {level}: {title.split('–')[0].trim()}</h3>
                  <span className="text-xs font-semibold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5 mb-3" />

                <div className="space-y-2">
                  {lvlModules.map(mod => {
                    const expanded = expandedId === mod.id;
                    return (
                      <div key={mod.id} className="border border-border rounded-2xl overflow-hidden">
                        <button onClick={() => setExpandedId(expanded ? null : mod.id)} className="w-full flex items-center gap-3 p-4 text-left">
                          {mod.completed ? (
                            <CircleCheck className="h-5 w-5 text-primary shrink-0" strokeWidth={1.5} />
                          ) : (
                            <Circle className="h-5 w-5 text-border shrink-0" strokeWidth={1.5} />
                          )}
                          <span className="flex-1 font-medium text-sm text-foreground">L{mod.level}.{mod.module_number} {mod.title}</span>
                          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /> : <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />}
                        </button>
                        {expanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="px-4 pb-4 border-t border-border pt-4"
                          >
                            <ul className="space-y-2 mb-5">
                              {mod.content.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                  <span className="text-primary mt-0.5">•</span><span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              size="sm"
                              onClick={() => toggleComplete.mutate(mod.id)}
                              className={`rounded-xl ${!mod.completed ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                              variant={mod.completed ? 'outline' : 'default'}
                            >
                              {mod.completed ? 'Mark Incomplete' : 'Mark as Complete'}
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </PageTransition>
    </div>
  );
}
