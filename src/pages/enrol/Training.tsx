import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, ChevronDown, ChevronUp, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { trainingModules } from '@/data/mockData';
import { TrainingModule } from '@/types';

export default function Training() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<TrainingModule[]>(trainingModules);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const levels = [1, 2, 3];
  const levelProgress = (level: number) => {
    const lvlModules = modules.filter(m => m.level === level);
    const completed = lvlModules.filter(m => m.completed).length;
    return Math.round((completed / lvlModules.length) * 100);
  };

  const toggleComplete = (id: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero px-6 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-primary-foreground/10"><ArrowLeft className="h-4 w-4 text-primary-foreground" /></button>
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-secondary" />
            <span className="font-display font-bold text-primary-foreground">Training Programme</span>
          </div>
        </div>
        <p className="text-primary-foreground/70 text-sm">Become a Five-Star Cleaner with Indiana Green</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-primary-foreground/70 mb-1">
            <span>Overall Progress</span>
            <span>{modules.filter(m => m.completed).length}/{modules.length} modules</span>
          </div>
          <Progress value={(modules.filter(m => m.completed).length / modules.length) * 100} className="h-2 bg-primary-foreground/20" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {levels.map(level => {
          const lvlModules = modules.filter(m => m.level === level);
          const title = lvlModules[0]?.levelTitle || `Level ${level}`;
          const progress = levelProgress(level);

          return (
            <section key={level}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-foreground">Level {level}: {title.split('–')[0]}</h3>
                <span className="text-xs text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5 mb-3" />

              <div className="space-y-2">
                {lvlModules.map(mod => {
                  const expanded = expandedId === mod.id;
                  return (
                    <div key={mod.id} className="glass-card rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedId(expanded ? null : mod.id)}
                        className="w-full flex items-center gap-3 p-4 text-left"
                      >
                        {mod.completed ? (
                          <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                        )}
                        <span className="flex-1 font-medium text-sm text-foreground">
                          L{mod.level}.{mod.moduleNumber} {mod.title}
                        </span>
                        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </button>

                      {expanded && (
                        <div className="px-4 pb-4 border-t border-border pt-3">
                          <ul className="space-y-2 mb-4">
                            {mod.content.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                          <Button
                            size="sm"
                            onClick={() => toggleComplete(mod.id)}
                            variant={mod.completed ? 'outline' : 'default'}
                            className={!mod.completed ? 'gradient-primary text-primary-foreground' : ''}
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
    </div>
  );
}
