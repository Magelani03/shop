import { useState } from 'react';
import { Facebook, MessageCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import perfumeBottle from '@/assets/products/perfume-bottle.jpg';
import { postContactWhatsApp } from '@/lib/api';
import { navigatePopupToWhatsApp } from '@/lib/openWhatsAppSafe';
import { cn } from '@/lib/utils';

const FOOTER_SUBJECT = 'Footer — Keep in Touch';

const Footer = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const popup = window.open('about:blank', '_blank');
    setSubmitting(true);
    try {
      const res = await postContactWhatsApp({
        name: name.trim() || 'Customer',
        email: email.trim(),
        subject: FOOTER_SUBJECT,
        message: message.trim(),
        inquiryType: 'general',
      });

      if (res.configured && res.whatsappUrl) {
        navigatePopupToWhatsApp(popup, res.whatsappUrl, {
          successToast: 'Opening WhatsApp…',
        });
        setName('');
        setEmail('');
        setMessage('');
      } else {
        popup?.close();
        toast.info(
          res.error ??
            'WhatsApp is not configured for this store yet.',
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
    <footer className="relative mt-auto overflow-hidden border-t border-white/10 bg-charcoal text-primary-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-sage/25 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative container py-14 md:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10 lg:gap-14">
          {/* Keep in Touch */}
          <div className="space-y-5 md:max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary-foreground/90">
              <Sparkles className="h-3 w-3 text-sage-light" />
              WhatsApp desk
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">Keep in touch</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/65">
                A short note is all we need. We will open a WhatsApp draft so you can polish the message before it is sent.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className={cn(
                'space-y-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent p-5 shadow-xl shadow-black/20 backdrop-blur-sm',
                'ring-1 ring-white/5',
              )}
            >
              <div className="space-y-1.5">
                <Label htmlFor="footer-name" className="text-[0.7rem] font-semibold uppercase tracking-wider text-primary-foreground/70">
                  Name <span className="font-normal normal-case text-primary-foreground/45">(optional)</span>
                </Label>
                <Input
                  id="footer-name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 border-white/10 bg-charcoal/80 text-primary-foreground placeholder:text-primary-foreground/35 focus-visible:ring-sage/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="footer-email" className="text-[0.7rem] font-semibold uppercase tracking-wider text-primary-foreground/70">
                  Email
                </Label>
                <Input
                  id="footer-email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-white/10 bg-charcoal/80 text-primary-foreground placeholder:text-primary-foreground/35 focus-visible:ring-sage/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="footer-message" className="text-[0.7rem] font-semibold uppercase tracking-wider text-primary-foreground/70">
                  Message
                </Label>
                <Textarea
                  id="footer-message"
                  placeholder="How can we help?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="min-h-[100px] resize-y border-white/10 bg-charcoal/80 text-primary-foreground placeholder:text-primary-foreground/35 focus-visible:ring-sage/40"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="group h-11 w-full rounded-full bg-gradient-to-r from-sage to-sage-dark font-semibold text-primary-foreground shadow-lg shadow-sage/20 transition hover:opacity-[0.96] sm:w-auto sm:px-8"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing…
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Open WhatsApp draft
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Customer Service */}
          <div className="space-y-5">
            <h3 className="font-display text-2xl font-semibold tracking-tight">Customer service</h3>
            <div className="space-y-4 text-sm leading-relaxed text-primary-foreground/70">
              <p>
                Monday–Friday 9am–9pm EST · Saturday 9am–6pm EST. For urgent order issues, WhatsApp gets the fastest loop.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">Direct line</p>
                <p className="mt-1 font-display text-lg font-semibold text-primary-foreground">+264 81 657 7896</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-primary-foreground/80">
                  Orders & tracking
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-primary-foreground/80">
                  Product guidance
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-primary-foreground/80">
                  Complaints
                </span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-primary-foreground transition hover:border-sage/50 hover:bg-sage/15"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-primary-foreground transition hover:border-sage/50 hover:bg-sage/15"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Image */}
          <div className="hidden items-center justify-center md:flex">
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-sage/30 to-transparent blur-xl" aria-hidden />
              <img
                src={perfumeBottle}
                alt="Featured product"
                className="relative w-44 max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10 lg:w-52"
              />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-center text-xs text-primary-foreground/45 md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} SHOP. Crafted for clarity and care.</p>
          <p className="max-w-md md:text-right">
            Messages are composed in your WhatsApp app—nothing is transmitted until you send.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
