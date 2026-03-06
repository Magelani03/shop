import { Minus, Plus, Trash2 } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartStore, useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

const SHIPPING_FEE = 150;

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const total = subtotal + SHIPPING_FEE;

  const handleCheckout = () => {
    const { isAuthenticated, setShowAuthModal } = useAuthStore.getState();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    toast.success('Order placed successfully!');
    clearCart();
  };

  if (items.length === 0) {
    return (
      <SidebarLayout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to get started</p>
          <Button asChild className="rounded-full">
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl font-bold">Shopping Cart</h1>
              <span className="text-lg font-medium text-muted-foreground">
                {items.length} items
              </span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted rounded-t-lg text-sm font-medium text-muted-foreground">
              <div className="col-span-5">PRODUCT DETAILS</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Total</div>
              <div className="col-span-1"></div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 bg-card rounded-lg border border-border"
                >
                  <div className="col-span-5 flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-medium text-foreground line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 h-10 flex items-center justify-center bg-charcoal text-primary-foreground rounded-lg font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="bg-charcoal text-primary-foreground px-3 py-2 rounded-lg font-medium">
                      {item.price.toFixed(0)}
                    </span>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="bg-charcoal text-primary-foreground px-3 py-2 rounded-lg font-medium">
                      {(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 hover:bg-destructive/10 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-muted rounded-2xl p-6 h-fit space-y-6">
            <h2 className="font-display text-xl font-bold">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">{items.length} items</span>
                <span className="font-bold">N${subtotal.toFixed(0)}</span>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Shipping Fee</label>
                <Select defaultValue="standard">
                  <SelectTrigger className="bg-background border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard N${SHIPPING_FEE}</SelectItem>
                    <SelectItem value="express">Express N$250</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Cost</span>
                  <span>N${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 rounded-full text-lg py-6"
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Cart;
