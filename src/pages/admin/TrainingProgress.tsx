import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/layout/AdminLayout';
import { trainingModules, cleaners } from '@/data/mockData';

export default function AdminTrainingProgress() {
  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Training Progress</h1>
      
      <div className="space-y-4">
        {cleaners.map(cleaner => {
          const completed = Math.floor(Math.random() * trainingModules.length);
          const progress = Math.round((completed / trainingModules.length) * 100);
          return (
            <div key={cleaner.id} className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {cleaner.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{cleaner.name}</p>
                    <p className="text-xs text-muted-foreground">{completed}/{trainingModules.length} modules completed</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
