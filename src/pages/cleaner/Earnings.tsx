import { ArrowLeft, TrendingUp, PoundSterling } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CleanerLayout from '@/components/layout/CleanerLayout';

const weeklyData = [
  { day: 'Mon', amount: 72 }, { day: 'Tue', amount: 54 }, { day: 'Wed', amount: 90 },
  { day: 'Thu', amount: 36 }, { day: 'Fri', amount: 108 }, { day: 'Sat', amount: 126 }, { day: 'Sun', amount: 0 },
];

export default function CleanerEarnings() {
  const navigate = useNavigate();
  const total = weeklyData.reduce((s, d) => s + d.amount, 0);
  const max = Math.max(...weeklyData.map(d => d.amount));

  return (
    <CleanerLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Earnings</h1>
        </div>

        <div className="glass-card rounded-2xl p-8 text-center mb-6 shadow-apple">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-3">
            <PoundSterling className="h-7 w-7 text-primary" />
          </div>
          <div className="text-4xl font-extrabold text-foreground">£{total}</div>
          <p className="text-sm text-muted-foreground mt-1">This week</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-secondary font-semibold">
            <TrendingUp className="h-3 w-3" /> 12% from last week
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-apple">
          <h3 className="font-bold text-foreground mb-5">Daily Breakdown</h3>
          <div className="flex items-end gap-2 h-40">
            {weeklyData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-medium text-muted-foreground">£{d.amount}</span>
                <div className="w-full rounded-xl relative overflow-hidden" style={{ height: `${max > 0 ? (d.amount / max) * 100 : 0}%`, minHeight: '4px' }}>
                  <div className="absolute inset-0 rounded-xl gradient-blue" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CleanerLayout>
  );
}
