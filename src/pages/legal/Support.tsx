import { Mail, Phone, MessageCircle, Clock, MapPin } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Support = () => {
  const faqs = [
    { q: "How do I book a cleaner?", a: "Open the app, tap 'Book a Clean', choose Express (instant) or Schedule, pick your service, confirm the address and pay. You'll be matched with a verified cleaner in minutes." },
    { q: "Are all cleaners verified?", a: "Yes. Every cleaner completes a DBS background check, Right to Work verification, and our 3-level training programme before taking jobs." },
    { q: "How do I cancel or reschedule?", a: "Go to 'My Bookings', open the booking, and tap Cancel or Reschedule. Free up to 2 hours before the job; a small fee applies after that." },
    { q: "How do refunds work?", a: "If you're unhappy, contact support within 24 hours of the job. We investigate and issue a full or partial refund where appropriate." },
    { q: "How do I become a cleaner?", a: "Tap 'Join as a Cleaner' on the login screen, complete the application, upload your documents, and finish the training modules." },
    { q: "I forgot my OTP / can't log in", a: "OTPs are sent to the phone number you registered with. Wait 30 seconds and tap 'Resend'. Still stuck? Email support@cleanfit.app." },
    { q: "How do loyalty Coins work?", a: "Earn 1 Coin per £5 spent. 10 Coins = £1 off your next clean. Complete 10 jobs in a month to unlock a free clean." },
    { q: "Is Clean Fit available outside London?", a: "We're currently live in London and surrounding areas. Enter your postcode at signup to check coverage." },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Support</h1>
        <p className="text-muted-foreground mb-8">We're here to help. Most questions are answered below.</p>

        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          <a href="mailto:support@cleanfit.app" className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:bg-accent transition">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">Email us</div>
              <div className="text-sm text-muted-foreground">support@cleanfit.app</div>
            </div>
          </a>
          <a href="tel:+442038858000" className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:bg-accent transition">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">Call us</div>
              <div className="text-sm text-muted-foreground">+44 20 3885 8000</div>
            </div>
          </a>
          <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">Hours</div>
              <div className="text-sm text-muted-foreground">Mon–Sun, 7am–10pm GMT</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">Based in</div>
              <div className="text-sm text-muted-foreground">London, United Kingdom</div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          Frequently asked questions
        </h2>

        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-4">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 rounded-2xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Still need help?</p>
          <a href="mailto:support@cleanfit.app" className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
            Email Support
          </a>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          See also our <a href="/privacy" className="underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Support;
