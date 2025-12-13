import { Facebook, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import perfumeBottle from '@/assets/products/perfume-bottle.jpg';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-primary-foreground mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Keep in Touch */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-semibold">Keep in Touch</h3>
            <p className="text-sm text-primary-foreground/70">
              Our Team will get back to you as soon as possible
            </p>
            <div className="space-y-3">
              <Input
                placeholder="Email"
                className="bg-background text-foreground border-0 rounded-full"
              />
              <Textarea
                placeholder="Message"
                className="bg-background text-foreground border-0 rounded-2xl min-h-[100px]"
              />
              <Button variant="outline" className="rounded-full px-8 bg-background text-foreground hover:bg-muted border-0">
                Submit
              </Button>
            </div>
          </div>
          
          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-semibold">Customer Service</h3>
            <div className="text-sm text-primary-foreground/70 space-y-2">
              <p>
                Operating hours are from 9am-9pm EST Monday-Friday and 9am-6pm EST Saturday.
                Reach out today!
              </p>
              <p className="font-medium text-primary-foreground">Happyclient@shop.com</p>
              <p className="font-medium text-primary-foreground">+264 81 657 7896</p>
            </div>
            <div className="space-y-2 pt-4">
              <p className="font-medium">Help & FAQS</p>
              <p className="font-medium">Accounts</p>
            </div>
            <div className="flex gap-4 pt-4">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Product Image */}
          <div className="hidden md:flex justify-center items-center">
            <img
              src={perfumeBottle}
              alt="Perfume bottle"
              className="w-48 h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

