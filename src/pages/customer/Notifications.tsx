import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Tag, CalendarDays } from 'lucide-react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { notifications } from '@/data/mockData';

const typeIcons = { booking: CalendarDays, promo: Tag, system: Bell };

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <CustomerLayout>
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-secondary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-secondary-foreground">Notifications</h1>
        </div>

        <div className="space-y-3">
          {notifications.map(n => {
            const Icon = typeIcons[n.type];
            return (
              <div key={n.id} className={`glass rounded-2xl p-4 flex gap-3 border border-secondary-foreground/5 ${!n.read ? 'border-l-4 border-l-primary' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-secondary-foreground">{n.title}</h4>
                  <p className="text-xs text-secondary-foreground/40 mt-0.5">{n.message}</p>
                  <p className="text-xs text-secondary-foreground/20 mt-1">{new Date(n.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CustomerLayout>
  );
}
