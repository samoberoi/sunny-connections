import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stages = [
  { key: 'submitted', label: 'Application Submitted' },
  { key: 'under-review', label: 'Under Review' },
  { key: 'interview', label: 'Interview' },
  { key: 'training', label: 'Training Programme' },
  { key: 'active', label: 'Active Professional' },
];

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const currentStage = 1; // under-review

  return (
    <div className="min-h-screen bg-background px-6 pt-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-muted"><ArrowLeft className="h-4 w-4" /></button>
        <h1 className="font-display text-xl font-semibold text-foreground">Application Status</h1>
      </div>

      <div className="glass-card rounded-xl p-6">
        {stages.map((stage, i) => {
          const done = i <= currentStage;
          const current = i === currentStage;
          return (
            <div key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                {done ? (
                  current ? <Clock className="h-6 w-6 text-secondary animate-pulse-gentle" /> : <CheckCircle className="h-6 w-6 text-primary" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/30" />
                )}
                {i < stages.length - 1 && <div className={`w-0.5 h-10 ${done ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
              <div className="pb-4">
                <p className={`font-medium text-sm ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{stage.label}</p>
                {current && <p className="text-xs text-muted-foreground">We're reviewing your application</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <Button onClick={() => navigate('/enrol/training')} variant="outline" className="w-full">
          Preview Training Programme
        </Button>
      </div>
    </div>
  );
}
