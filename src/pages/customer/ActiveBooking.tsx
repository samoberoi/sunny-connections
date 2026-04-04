import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/components/layout/CustomerLayout';

const statuses = [
  { key: 'assigned', label: 'Cleaner Assigned', desc: 'Emma Thompson has been assigned' },
  { key: 'en-route', label: 'En Route', desc: 'Your cleaner is on the way' },
  { key: 'otp-verified', label: 'OTP Verified', desc: 'Cleaner has arrived and verified' },
  { key: 'in-progress', label: 'In Progress', desc: 'Cleaning is underway' },
  { key: 'completed', label: 'Completed', desc: 'Service complete!' },
];

export default function ActiveBooking() {
  const [currentStatus, setCurrentStatus] = useState(1);
  const navigate = useNavigate();

  return (
    <CustomerLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Booking Status</h1>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6 shadow-apple">
          {statuses.map((status, i) => {
            const done = i <= currentStatus;
            const current = i === currentStatus;
            return (
              <div key={status.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {done ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle className={`h-7 w-7 ${current ? 'text-primary animate-pulse' : 'text-primary'}`} />
                    </motion.div>
                  ) : (
                    <Circle className="h-7 w-7 text-muted-foreground/20" />
                  )}
                  {i < statuses.length - 1 && <div className={`w-0.5 h-12 rounded-full ${done ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
                <div className="pb-6">
                  <p className={`font-semibold text-sm ${done ? 'text-foreground' : 'text-muted-foreground/50'}`}>{status.label}</p>
                  <p className={`text-xs ${done ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}>{status.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button size="sm" variant="outline" onClick={() => setCurrentStatus(Math.max(0, currentStatus - 1))} className="rounded-xl">
            Previous
          </Button>
          <Button size="sm" onClick={() => {
            if (currentStatus < statuses.length - 1) setCurrentStatus(currentStatus + 1);
            else navigate('/rate-service');
          }} className="rounded-xl gradient-blue text-primary-foreground">
            {currentStatus < statuses.length - 1 ? 'Next Step' : 'Rate Service'}
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
