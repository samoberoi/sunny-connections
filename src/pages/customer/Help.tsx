import { useState } from 'react';
import { Search, MessageCircle, Mail, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import CustomerLayout from '@/components/layout/CustomerLayout';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';

const faqs = [
  { q: 'How do I book a cleaning?', a: 'Tap "Schedule Cleaning" or "Express Clean" on the home page. Choose your service, date, time, and address. Confirm payment and we\'ll find the best cleaner for you.' },
  { q: 'Can I cancel or reschedule?', a: 'You can cancel or reschedule any booking with status "Pending" or "Assigned" from the My Bookings page. Cancellations after the cleaner is en-route may incur a partial charge.' },
  { q: 'How is pricing calculated?', a: 'Pricing is based on the service type and duration. Each service has an hourly rate shown on the Services page. The total is calculated as rate × hours.' },
  { q: 'What is the CleanFit Guarantee?', a: 'We guarantee quality on every clean. If you\'re not satisfied, contact us within 24 hours and we\'ll arrange a free re-clean or full refund.' },
  { q: 'How do CleanFit Coins work?', a: 'Earn coins by rating completed services (10 coins per rating) and referring friends. Coins can be redeemed for discounts on future bookings in the Wallet section.' },
  { q: 'Are cleaners background-checked?', a: 'Yes! All CleanFit cleaners undergo DBS checks, reference verification, and complete our certified training programme before they can accept jobs.' },
  { q: 'What payment methods are accepted?', a: 'We accept debit/credit cards and cash payments. You can select your preferred method during checkout.' },
  { q: 'How do I refer a friend?', a: 'Go to your Profile page and use the "Refer a Mate" card. Share your unique link via WhatsApp or copy it. When your friend completes their first booking, you both earn rewards!' },
  { q: 'What if something is damaged?', a: 'CleanFit carries liability insurance. Report any damage within 48 hours via the Help section and we\'ll investigate and compensate accordingly.' },
  { q: 'Can I request the same cleaner?', a: 'Yes! After a completed booking, tap the heart icon to add the cleaner to your Favourites. You can then request them for future bookings.' },
];

export default function Help() {
  const [search, setSearch] = useState('');

  const filtered = faqs.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CustomerLayout>
      <PageTransition>
        <div className="px-5 pt-14 pb-6 space-y-5">
          <div className="flex items-center gap-3">
            <BackButton to="/profile" />
            <h1 className="text-2xl font-display font-black text-foreground">Help & Support</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input placeholder="Search FAQ..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-11 h-12 rounded-2xl bg-card border-border" />
          </div>

          {/* FAQ */}
          <div className="bg-card rounded-3xl p-5 shadow-soft border border-border">
            <h3 className="font-display font-bold text-foreground text-sm mb-3">Frequently Asked Questions</h3>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No results found</p>
            ) : (
              <Accordion type="single" collapsible className="space-y-1">
                {filtered.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border last:border-0">
                    <AccordionTrigger className="text-sm font-bold text-foreground text-left py-3 hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-3">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* Contact */}
          <div className="bg-card rounded-3xl p-5 shadow-soft border border-border space-y-3">
            <h3 className="font-display font-bold text-foreground text-sm">Need more help?</h3>
            <Button
              onClick={() => window.open('https://wa.me/447000000000?text=Hi%20CleanFit%2C%20I%20need%20help%20with...', '_blank')}
              className="w-full h-12 rounded-full font-bold bg-[#25D366] hover:bg-[#25D366]/90 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp
            </Button>
            <Button
              onClick={() => window.open('mailto:support@cleanfit.app', '_blank')}
              variant="outline"
              className="w-full h-12 rounded-full font-bold border-2 border-border"
            >
              <Mail className="h-4 w-4 mr-2" /> Email Support
            </Button>
          </div>
        </div>
      </PageTransition>
    </CustomerLayout>
  );
}
