import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playNotificationSound } from '@/lib/notificationSound';

const quickTemplates = [
  'I am on the way 🚗',
  'Stuck in traffic 🚦',
  'I have arrived 📍',
  'Please open the door 🚪',
  'Thank you! 😊',
];

export default function Chat() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const bookingId = state?.bookingId;
  const otherName = state?.otherName || 'Chat';
  const otherPhone = state?.otherPhone;

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', bookingId],
    queryFn: async () => {
      if (!bookingId) return [];
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });
      return data || [];
    },
    enabled: !!bookingId,
    refetchInterval: 3000,
  });

  // Realtime
  useEffect(() => {
    if (!bookingId) return;
    const channel = supabase
      .channel(`chat-${bookingId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', bookingId] });
          // Play sound for messages from the other person
          if ((payload.new as any).sender_id !== user?.id) {
            playNotificationSound();
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [bookingId, queryClient, user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (text?: string) => {
      const content = (text || message).trim();
      if (!content || !bookingId || !user?.id) return;
      const { error } = await supabase.from('messages').insert({
        booking_id: bookingId,
        sender_id: user.id,
        content,
      });
      if (error) throw error;

      // Send notification to other party
      try {
        const { data: booking } = await supabase.from('bookings').select('customer_id, cleaner_id').eq('id', bookingId).maybeSingle();
        if (booking) {
          let recipientId: string | null = null;
          if (booking.customer_id === user.id && booking.cleaner_id) {
            // I'm customer, notify cleaner's user_id
            const { data: cleaner } = await supabase.from('cleaners').select('user_id').eq('id', booking.cleaner_id).maybeSingle();
            recipientId = cleaner?.user_id || null;
          } else if (booking.customer_id !== user.id) {
            recipientId = booking.customer_id;
          }
          if (recipientId) {
            await supabase.from('notifications').insert({
              user_id: recipientId,
              title: `New message from ${profile?.name || 'Someone'}`,
              message: content.length > 60 ? content.slice(0, 57) + '...' : content,
              type: 'booking',
            });
          }
        }
      } catch { /* notification is best-effort */ }
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', bookingId] });
    },
  });

  const handleQuickTemplate = (tpl: string) => {
    sendMessage.mutate(tpl);
  };

  const handleCall = () => {
    if (otherPhone) {
      window.open(`tel:${otherPhone}`, '_self');
    } else {
      alert('Phone number not available for this booking.');
    }
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No active booking found for chat</p>
          <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          {otherName[0]}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">{otherName}</p>
          <p className="text-[10px] text-muted-foreground">Active booking</p>
        </div>
        <button onClick={handleCall} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Phone className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg: any) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                isMine
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-accent text-foreground rounded-bl-md'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-[9px] mt-1 ${isMine ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Templates */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {quickTemplates.map(tpl => (
          <button
            key={tpl}
            onClick={() => handleQuickTemplate(tpl)}
            className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full border border-border bg-accent text-foreground hover:bg-primary/10 transition-colors"
          >
            {tpl}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3 pb-safe">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage.mutate(); }} className="flex gap-2">
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-accent border-0 h-11 px-4 text-sm"
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending}
            size="icon"
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground shrink-0"
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </form>
      </div>
    </div>
  );
}
