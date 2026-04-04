import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import BackButton from '@/components/BackButton';
import PageTransition from '@/components/PageTransition';
import { useTrainingModules } from '@/hooks/useTrainingModules';
import { Skeleton } from '@/components/ui/skeleton';

export default function Training() {
  const navigate = useNavigate();
  const { data: dbModules, isLoading } = useTrainingModules();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const modules = (dbModules || []).map(m => ({
    ...m,
    completed: completedIds.has(m.id),
  }));

  const levels = [1, 2, 3];
  const levelProgress = (level: number) => {
    const lvlModules = modules.filter(m => m.level === level);
    const completed = lvlModules.filter(m => m.completed).length;
    return lvlModules.length > 0 ? Math.round((completed / lvlModules.length) * 100) : 0;
  };

  const toggleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
      <div className="gradient-hero px-5 pt-6 pb-10 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="font-bold text-primary-foreground">Training Programme</span>
        </div>
        <p className="text-primary-foreground/60 text-sm mb-4">Become a Five-Star Cleaner with Cleanfit</p>
        <div>
          <div className="flex justify-between text-xs text-primary-foreground/60 mb-1.5">
            <span>Overall Progress</span>
            <span>{totalCompleted}/{modules.length} modules</span>
          </div>
          <Progress value={modules.length > 0 ? (totalCompleted / modules.length) * 100 : 0} className="h-2 bg-primary-foreground/20" />
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
                  <h3 className="font-bold text-foreground text-sm">Level {level}: {title.split('–')[0].trim()}</h3>
                  <span className="text-xs font-semibold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5 mb-3" />

                <div className="space-y-2">
                  {lvlModules.map(mod => {
                    const expanded = expandedId === mod.id;
                    return (
                      <div key={mod.id} className="glass-card rounded-2xl overflow-hidden shadow-apple">
                        <button onClick={() => setExpandedId(expanded ? null : mod.id)} className="w-full flex items-center gap-3 p-4 text-left">
                          {mod.completed ? (
                            <CircleCheck className="h-5 w-5 text-primary shrink-0" strokeWidth={1.5} />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/20 shrink-0" strokeWidth={1.5} />
                          )}
                          <span className="flex-1 font-medium text-sm text-foreground">L{mod.level}.{mod.module_number} {mod.title}</span>
                          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /> : <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />}
                        </button>
                        {expanded && (
                          <div className="px-4 pb-4 border-t border-border pt-4">
                            <ul className="space-y-2 mb-5">
                              {mod.content.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                  <span className="text-primary mt-0.5">•</span><span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              size="sm"
                              onClick={() => toggleComplete(mod.id)}
                              className={`rounded-xl ${!mod.completed ? 'gradient-blue text-primary-foreground shadow-blue/30' : ''}`}
                              variant={mod.completed ? 'outline' : 'default'}
                            >
                              {mod.completed ? 'Mark Incomplete' : 'Mark as Complete'}
                            </Button>
                          </div>
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
