import { motion } from 'framer-motion';
import { MapPin, Clock, Home, Building2, Landmark, Repeat, CalendarDays, CheckCircle2, CircleDashed, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/BackButton';

const propertyIcons: Record<string, any> = { flat: Building2, house: Home, office: Landmark };

function formatDateUK(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function calcEndTime(timeStr: string, durationHrs: number): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  return formatTime12h(`${h + durationHrs}:${String(m).padStart(2, '0')}`);
}

interface Props {
  representative: any;
  siblings: any[];
  onAccept: () => void;
  onBack: () => void;
  isAccepting?: boolean;
}

export default function RecurringJobDetail({ representative, siblings, onAccept, onBack, isAccepting }: Props) {
  const sorted = [...siblings].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = sorted[0]?.date;
  const lastDate = sorted[sorted.length - 1]?.date;
  const PropIcon = propertyIcons[representative.property_type] || Home;
  const totalCost = sorted.reduce((sum: number, b: any) => sum + Number(b.total_cost), 0);

  const statusColor = (s: string) => {
    if (s === 'completed') return 'bg-primary/10 text-primary';
    if (s === 'assigned' || s === 'en-route') return 'bg-foreground text-background';
    if (s === 'cancelled') return 'bg-destructive/10 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="px-5 pt-6 pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <h1 className="text-lg font-display font-black text-foreground">Recurring Job</h1>
        <Badge className="ml-auto text-[9px] rounded-lg font-medium border-0 bg-primary/10 text-primary">
          <Repeat className="h-2.5 w-2.5 mr-0.5" strokeWidth={1.5} />
          {representative.recurring} · {sorted.length} sessions
        </Badge>
      </div>

      {/* Customer & Job Info */}
      <div className="bg-muted/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-lg">
            {representative.customer_name?.[0] || '?'}
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground text-sm">{representative.customer_name}</h3>
            <p className="text-[11px] text-muted-foreground">{representative.service_name}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <PropIcon className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={1.5} />
            <span className="capitalize">{representative.property_type}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={1.5} />
            <span>{representative.address_line1}, {representative.address_postcode}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={1.5} />
            <span>{formatDateUK(firstDate)} → {formatDateUK(lastDate)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={1.5} />
            <span>{formatTime12h(representative.time)} – {calcEndTime(representative.time, representative.duration)} ({representative.duration}h daily)</span>
          </div>
        </div>

        {representative.notes && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
            <p className="text-xs text-foreground">{representative.notes}</p>
          </div>
        )}

        <div className="pt-3 border-t border-border/50 flex justify-between items-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Earnings</span>
          <span className="text-xl font-display font-black text-primary">£{totalCost.toFixed(0)}</span>
        </div>
      </div>

      {/* Session Tiles */}
      <div>
        <h3 className="font-display font-bold text-foreground text-sm mb-3">
          All Sessions ({sorted.length})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {sorted.map((b: any, i: number) => {
            const isCompleted = b.status === 'completed';
            const isCancelled = b.status === 'cancelled';
            const isPending = b.status === 'pending';
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`rounded-xl p-3 border ${
                  isCompleted ? 'bg-primary/5 border-primary/20' :
                  isCancelled ? 'bg-destructive/5 border-destructive/20 opacity-50' :
                  'bg-muted/30 border-border/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground">#{i + 1}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                  ) : (
                    <CircleDashed className="h-3.5 w-3.5 text-muted-foreground/40" strokeWidth={1.5} />
                  )}
                </div>
                <p className="text-xs font-bold text-foreground">{formatDateUK(b.date)}</p>
                <p className="text-[10px] text-muted-foreground">{formatTime12h(b.time)}</p>
                <Badge className={`mt-1.5 text-[8px] rounded-md font-medium border-0 ${statusColor(b.status)}`}>
                  {b.status.replace('-', ' ')}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Accept All Button - only show for pending unassigned jobs */}
      {sorted.some((b: any) => b.status === 'pending' && !b.cleaner_id) && (
        <Button onClick={onAccept} disabled={isAccepting}
          className="w-full h-12 rounded-2xl text-sm font-bold">
          <CheckCircle2 className="h-4 w-4 mr-1.5" />
          {isAccepting ? 'Accepting...' : `Accept All ${sorted.length} Sessions`}
        </Button>
      )}
    </div>
  );
}
