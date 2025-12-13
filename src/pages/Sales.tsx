import SidebarLayout from '@/components/layout/SidebarLayout';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/products';

const Sales = () => {
  // Filter products with discounts or create mock sale items
  const saleProducts = products.filter((p) => p.discount).length > 0
    ? products.filter((p) => p.discount)
    : products.slice(0, 6).map((p) => ({ ...p, discount: Math.floor(Math.random() * 30) + 20 }));

  return (
    <SidebarLayout>
      <div className="p-6 space-y-8">
        {/* Sale Banner */}
        <div className="relative bg-gradient-to-r from-primary to-sage-dark rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10" />
          <div className="relative p-8 md:p-12 text-center text-primary-foreground">
            <span className="inline-block bg-destructive text-destructive-foreground text-sm font-bold px-4 py-1 rounded-full mb-4 animate-pulse">
              LIMITED TIME OFFER
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              Summer Sale
            </h1>
            <p className="text-xl md:text-2xl mb-2">
              Get up to <span className="font-bold">40% OFF</span> on selected items
            </p>
            <p className="text-primary-foreground/80">
              With purchases over N$500
            </p>
          </div>
        </div>

        {/* Promo Codes */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-cream rounded-xl p-4 border-2 border-dashed border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Use code</p>
                <p className="font-display text-xl font-bold text-primary">SUMMER40</p>
              </div>
              <span className="text-2xl font-bold text-primary">40%</span>
            </div>
          </div>
          <div className="bg-cream rounded-xl p-4 border-2 border-dashed border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Use code</p>
                <p className="font-display text-xl font-bold text-primary">NEWUSER25</p>
              </div>
              <span className="text-2xl font-bold text-primary">25%</span>
            </div>
          </div>
          <div className="bg-cream rounded-xl p-4 border-2 border-dashed border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Free Shipping</p>
                <p className="font-display text-xl font-bold text-primary">FREESHIP</p>
              </div>
              <span className="text-lg font-bold text-primary">N$500+</span>
            </div>
          </div>
        </div>

        {/* Sale Products */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-6">Sale Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {saleProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-charcoal rounded-3xl p-8 md:p-12 text-center text-primary-foreground">
          <h2 className="font-display text-3xl font-bold mb-3">
            Don't Miss Out!
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive 
            sales, new arrivals, and special offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-background text-foreground placeholder:text-muted-foreground"
            />
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Sales;
