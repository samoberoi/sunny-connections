import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import PageTransition from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const stages = [
  { key: 'submitted', label: 'Application Submitted', desc: "We've got your details" },
  { key: 'under-review', label: 'Under Review', desc: 'Our team is having a proper look' },
  { key: 'interview', label: 'Interview', desc: 'Quick chat to get to know you' },
  { key: 'training', label: 'Training Programme', desc: 'Learn the Clean Fit way' },
  { key: 'active', label: 'Active Professional', desc: 'Welcome to the team! 🎉' },
];

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: application } = useQuery({
    queryKey: ['my-application', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('enrolment_applications').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(1).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const currentStage = application ? stages.findIndex(s => s.key === application.status) : 0;

  return (
    <div className="min-h-screen bg-background px-5 pt-6 pb-6">
      <PageTransition>
        <div className="flex items-center gap-3 mb-6">
          <BackButton to="/" />
          <h1 className="text-xl font-display font-black text-foreground">Application Status</h1>
        </div>

        {/* Status card */}
        <div className="bg-primary rounded-2xl p-5 mb-6 text-center">
          <p className="text-primary-foreground/60 text-xs uppercase tracking-wider font-medium mb-1">Current Status</p>
          <p className="text-primary-foreground font-display font-black text-lg">
            {stages[currentStage]?.label || 'Submitted'}
          </p>
        </div>

        <div className="border border-border rounded-2xl p-6">
          {stages.map((stage, i) => {
            const done = i <= currentStage;
            const current = i === currentStage;
            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  {done ? (
                    current ? (
                      <div className="relative">
                        <Clock className="h-6 w-6 text-primary-ink" strokeWidth={1.5} />
                        <div className="absolute inset-0 h-6 w-6 rounded-full bg-primary/20 animate-ping" />
                      </div>
                    ) : (
                      <CircleCheck className="h-6 w-6 text-primary-ink" strokeWidth={1.5} />
                    )
                  ) : (
                    <Circle className="h-6 w-6 text-border" strokeWidth={1.5} />
                  )}
                  {i < stages.length - 1 && (
                    <div className={`w-0.5 h-10 rounded-full transition-colors ${done ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`font-semibold text-sm ${done ? 'text-foreground' : 'text-muted-foreground/40'}`}>{stage.label}</p>
                  <p className={`text-xs ${done ? 'text-muted-foreground' : 'text-muted-foreground/20'}`}>{stage.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6">
          <Button onClick={() => navigate('/enrol/training')} variant="outline" className="w-full h-12 rounded-2xl border-primary-ink/20 text-primary-ink font-medium hover:bg-accent">
            Preview Training Programme
          </Button>
        </div>
      </PageTransition>
    </div>
  );
}
