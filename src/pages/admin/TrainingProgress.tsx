import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/layout/AdminLayout';
import { useCleaners } from '@/hooks/useCleaners';
import { useTrainingModules } from '@/hooks/useTrainingModules';

export default function AdminTrainingProgress() {
  const { data: cleaners = [] } = useCleaners();
  const { data: modules = [] } = useTrainingModules();

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Training Progress</h1>
      <div className="space-y-4">
        {cleaners.map((cleaner, idx) => {
          const completed = [3, 7, 5, 2, 8][idx] || 0;
          const progress = modules.length > 0 ? Math.round((completed / modules.length) * 100) : 0;
          return (
            <div key={cleaner.id} className="glass-card-elevated rounded-2xl p-5 shadow-apple">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center text-primary-foreground font-bold shadow-blue/30">{cleaner.name[0]}</div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{cleaner.name}</p>
                    <p className="text-xs text-muted-foreground">{completed}/{modules.length} modules</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
