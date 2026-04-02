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
      <div className="px-6 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="font-display text-xl font-semibold text-foreground">Earnings</h1>
        </div>

        <div className="glass-card rounded-xl p-6 text-center mb-6">
          <PoundSterling className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="font-display text-3xl font-bold text-foreground">£{total}</div>
          <p className="text-sm text-muted-foreground">This week</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-primary">
            <TrendingUp className="h-3 w-3" /> 12% from last week
          </div>
        </div>

        {/* Bar chart */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground mb-4">Daily Breakdown</h3>
          <div className="flex items-end gap-2 h-40">
            {weeklyData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">£{d.amount}</span>
                <div className="w-full rounded-t-md bg-primary/20 relative" style={{ height: `${max > 0 ? (d.amount / max) * 100 : 0}%`, minHeight: '4px' }}>
                  <div className="absolute inset-0 rounded-t-md gradient-primary opacity-70" />
                </div>
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CleanerLayout>
  );
}
