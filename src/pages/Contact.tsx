import { useState } from 'react';
import {
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { postContactWhatsApp, type ContactInquiryType } from '@/lib/api';
import { navigatePopupToWhatsApp } from '@/lib/openWhatsAppSafe';
import { cn } from '@/lib/utils';

const inquiryOptions: {
  value: ContactInquiryType;
  label: string;
  description: string;
  icon: typeof MessageSquare;
}[] = [
  {
    value: 'general',
    label: 'General',
    description: 'Orders & info',
    icon: MessageSquare,
  },
  {
    value: 'question',
    label: 'Question',
    description: 'Product help',
    icon: HelpCircle,
  },
  {
    value: 'complaint',
    label: 'Complaint',
    description: 'We will make it right',
    icon: AlertCircle,
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general' as ContactInquiryType,
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const popup = window.open('about:blank', '_blank');
    setSubmitting(true);
    try {
      const res = await postContactWhatsApp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        inquiryType: formData.inquiryType,
      });

      if (res.configured && res.whatsappUrl) {
        navigatePopupToWhatsApp(popup, res.whatsappUrl, {
          successToast: 'Opening WhatsApp with your message…',
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiryType: 'general',
          subject: '',
          message: '',
        });
      } else {
        popup?.close();
        toast.info(
          res.error ??
            'WhatsApp is not configured. Ask the store owner to set ADMIN_WHATSAPP or the admin WhatsApp setting.',
        );
      }
    } catch (err) {
      popup?.close();
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : 'Could not prepare WhatsApp message',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden">
        {/* Ambient background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute -top-24 left-1/4 h-[28rem] w-[28rem] rounded-full bg-sage/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-1/2 left-0 h-64 w-64 -translate-y-1/2 rounded-full bg-sage-light/30 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-6xl space-y-14 p-6 md:p-10">
          {/* Header */}
          <div className="mx-auto max-w-3xl space-y-5 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-sage/25 bg-sage/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sage">
              <Sparkles className="h-3.5 w-3.5" />
              Concierge
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl md:leading-[1.1]">
              We are one message away
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
              Share feedback, ask about an order, or log a concern. Your note is drafted in WhatsApp so you
              can review it before it reaches our team—fast, direct, and transparent.
            </p>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="relative rounded-[1.75rem] border border-border/60 bg-card/80 p-6 shadow-2xl shadow-sage/10 backdrop-blur-sm md:p-10">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sage/40 to-transparent"
                  aria-hidden
                />

                <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sage to-sage-dark text-primary-foreground shadow-lg shadow-sage/25">
                      <MessageCircle className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                        Compose your message
                      </h2>
                      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                        Fields are copied into a WhatsApp draft. Nothing is sent until you confirm in the app.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-sage" />
                    Private handoff
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                    No inbox queue
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                    Same-day response typical
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Inquiry focus
                    </Label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {inquiryOptions.map(({ value, label, description, icon: Icon }) => {
                        const active = formData.inquiryType === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFormData({ ...formData, inquiryType: value })}
                            className={cn(
                              'group flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all duration-200',
                              active
                                ? 'border-sage bg-sage/10 shadow-md shadow-sage/10 ring-1 ring-sage/30'
                                : 'border-border/80 bg-muted/20 hover:border-sage/40 hover:bg-muted/40',
                            )}
                          >
                            <Icon
                              className={cn(
                                'mb-2 h-5 w-5 transition-colors',
                                active ? 'text-sage' : 'text-muted-foreground group-hover:text-sage',
                              )}
                              strokeWidth={1.75}
                            />
                            <span className="text-sm font-semibold text-foreground">{label}</span>
                            <span className="mt-0.5 text-xs text-muted-foreground">{description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-sm font-medium">
                        Full name
                      </Label>
                      <Input
                        id="contact-name"
                        placeholder="Alex Johnson"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-11 border-border/60 bg-background/50 transition-shadow focus-visible:ring-sage/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11 border-border/60 bg-background/50 transition-shadow focus-visible:ring-sage/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone" className="text-sm font-medium">
                      Phone <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="+264 …"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-11 border-border/60 bg-background/50 transition-shadow focus-visible:ring-sage/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-subject" className="text-sm font-medium">
                      Subject line
                    </Label>
                    <Input
                      id="contact-subject"
                      placeholder="Brief headline for our team"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="h-11 border-border/60 bg-background/50 transition-shadow focus-visible:ring-sage/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message" className="text-sm font-medium">
                      Message
                    </Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Tell us what happened, what you need, or how we can help…"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="min-h-[160px] resize-y border-border/60 bg-background/50 transition-shadow focus-visible:ring-sage/30"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="group relative h-12 w-full overflow-hidden rounded-full bg-gradient-to-r from-sage via-sage to-sage-dark text-base font-semibold text-primary-foreground shadow-xl shadow-sage/25 transition hover:opacity-[0.97] hover:shadow-sage/35"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Preparing WhatsApp…
                        </>
                      ) : (
                        <>
                          Continue in WhatsApp
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </span>
                  </Button>
                </form>
              </div>
            </div>

            {/* Sidebar column */}
            <div className="space-y-6 lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                <div className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary via-primary to-sage-dark p-px shadow-xl">
                  <div className="rounded-[calc(1.75rem-1px)] bg-gradient-to-br from-primary to-sage-dark p-6 text-primary-foreground md:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
                      How it works
                    </p>
                    <ol className="mt-6 space-y-5">
                      {[
                        { step: '01', title: 'Fill the form', body: 'We capture context so our team replies with clarity.' },
                        { step: '02', title: 'Review in WhatsApp', body: 'A prefilled chat opens—edit tone or details freely.' },
                        { step: '03', title: 'Send when ready', body: 'You stay in control of what leaves your device.' },
                      ].map((item) => (
                        <li key={item.step} className="flex gap-4">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 font-mono text-sm font-bold">
                            {item.step}
                          </span>
                          <div>
                            <p className="font-semibold leading-tight">{item.title}</p>
                            <p className="mt-1 text-sm text-primary-foreground/80">{item.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 shadow-lg backdrop-blur-sm md:p-8">
                  <h2 className="font-display text-xl font-bold">Studio & hours</h2>
                  <div className="mt-6 space-y-5">
                    {[
                      {
                        icon: MessageCircle,
                        title: 'WhatsApp',
                        body: 'Preferred channel for orders and care.',
                      },
                      { icon: Phone, title: 'Phone', body: '+264 81 657 7896' },
                      { icon: MapPin, title: 'Address', body: '123 Beauty Lane, Windhoek, Namibia' },
                      {
                        icon: Clock,
                        title: 'Hours',
                        body: 'Mon–Fri 9am–9pm · Sat 9am–6pm EST',
                      },
                    ].map(({ icon: Icon, title, body }) => (
                      <div key={title} className="flex gap-4 border-b border-border/50 pb-5 last:border-0 last:pb-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-sage">
                          <Icon className="h-5 w-5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-dashed border-sage/35 bg-sage/5 p-6 md:p-8">
                  <h3 className="font-display text-lg font-bold">Quick answers</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Shipping, returns, and product questions—browse the FAQ or reach out here.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-5 rounded-full border-sage/40 bg-background/80 hover:bg-sage/10"
                    asChild
                  >
                    <Link to="/products">
                      Explore the shop
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Contact;
