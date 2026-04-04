import { useNavigate } from 'react-router-dom';
import { CircleCheck, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import PageTransition from '@/components/PageTransition';

const stages = [
  { key: 'submitted', label: 'Application Submitted' },
  { key: 'under-review', label: 'Under Review' },
  { key: 'interview', label: 'Interview' },
  { key: 'training', label: 'Training Programme' },
  { key: 'active', label: 'Active Professional' },
];

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const currentStage = 1;

  return (
    <div className="min-h-screen bg-background px-5 pt-6 pb-6">
      <PageTransition>
        <div className="flex items-center gap-3 mb-6">
          <BackButton to="/" />
          <h1 className="text-xl font-bold text-foreground">Application Status</h1>
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-apple">
          {stages.map((stage, i) => {
            const done = i <= currentStage;
            const current = i === currentStage;
            return (
              <div key={stage.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {done ? (
                    current ? <Clock className="h-6 w-6 text-primary animate-pulse" strokeWidth={1.5} /> : <CircleCheck className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground/20" strokeWidth={1.5} />
                  )}
                  {i < stages.length - 1 && <div className={`w-0.5 h-10 rounded-full transition-colors ${done ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
                <div className="pb-4">
                  <p className={`font-semibold text-sm ${done ? 'text-foreground' : 'text-muted-foreground/50'}`}>{stage.label}</p>
                  {current && <p className="text-xs text-muted-foreground">We're reviewing your application</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Button onClick={() => navigate('/enrol/training')} variant="outline" className="w-full h-12 rounded-2xl">
            Preview Training Programme
          </Button>
        </div>
      </PageTransition>
    </div>
  );
}
