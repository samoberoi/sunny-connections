import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowLeft } from 'lucide-react';
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
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-secondary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-secondary-foreground">Booking Status</h1>
        </div>

        <div className="glass rounded-2xl p-6 mb-6 border border-secondary-foreground/5">
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
                    <Circle className="h-7 w-7 text-secondary-foreground/10" />
                  )}
                  {i < statuses.length - 1 && <div className={`w-0.5 h-12 rounded-full ${done ? 'bg-primary' : 'bg-secondary-foreground/5'}`} />}
                </div>
                <div className="pb-6">
                  <p className={`font-semibold text-sm ${done ? 'text-secondary-foreground' : 'text-secondary-foreground/30'}`}>{status.label}</p>
                  <p className={`text-xs ${done ? 'text-secondary-foreground/50' : 'text-secondary-foreground/15'}`}>{status.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={() => setCurrentStatus(Math.max(0, currentStatus - 1))} className="flex-1 h-12 rounded-xl glass text-secondary-foreground/60 font-medium text-sm border border-secondary-foreground/5">
            Previous
          </button>
          <button onClick={() => {
            if (currentStatus < statuses.length - 1) setCurrentStatus(currentStatus + 1);
            else navigate('/rate-service');
          }} className="flex-1 h-12 rounded-xl gradient-lime text-primary-foreground font-bold text-sm shadow-lime">
            {currentStatus < statuses.length - 1 ? 'Next Step' : 'Rate Service'}
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
}
