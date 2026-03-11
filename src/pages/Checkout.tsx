import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCartStore, useAuthStore } from '@/lib/store';
import { createOrder, getOrderWhatsAppUrl } from '@/lib/api';
import { toast } from 'sonner';

const Checkout = () => {
    const navigate = useNavigate();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { user, token } = useAuthStore();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        notes: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = getTotalPrice();
    const SHIPPING_FEE = 150;
    const total = subtotal + SHIPPING_FEE;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error('Please login to place an order');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderData = {
                items: items.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
                customerInfo: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                },
                shippingAddress: formData.address,
                notes: formData.notes,
            };

            const authHeaders = { Authorization: `Bearer ${token}` };
            const order = await createOrder(orderData, authHeaders);

            if (order) {
                // Get WhatsApp URL and open it so the customer can send the order to the seller
                const whatsappData = await getOrderWhatsAppUrl(order.id, authHeaders);

                if (whatsappData?.whatsappUrl) {
                    toast.success('Order saved! Opening WhatsApp…');
                    window.open(whatsappData.whatsappUrl, '_blank');
                    clearCart();
                    navigate('/profile');
                } else {
                    toast.success('Order saved. WhatsApp is not configured—check your order in Profile.');
                    clearCart();
                    navigate('/profile');
                }
            } else {
                toast.error('Failed to create order');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('An error occurred during checkout');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <SidebarLayout>
                <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
                    <h1 className="font-display text-2xl font-bold mb-4">Your cart is empty</h1>
                    <Button onClick={() => navigate('/products')} className="rounded-full">
                        Browse Products
                    </Button>
                </div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="font-display text-3xl font-bold mb-2">Checkout</h1>
                <p className="text-muted-foreground mb-8">
                    No payment here—your order will be sent to WhatsApp. Payment will be arranged when you chat with the seller.
                </p>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. +264..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Shipping Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full delivery address"
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Order Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any special instructions?"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 text-lg rounded-full bg-primary hover:bg-primary/90 mt-4"
                        >
                            {isSubmitting ? 'Saving order...' : 'Save Order & Open WhatsApp'}
                        </Button>
                    </form>

                    {/* Order Summary */}
                    <div className="bg-muted rounded-2xl p-6 h-fit space-y-6">
                        <h2 className="font-display text-xl font-bold border-b border-border pb-4">Order Summary</h2>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between gap-4">
                                    <div className="flex gap-3">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                                        <div>
                                            <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-sm">N${(item.price * item.quantity).toFixed(0)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>N${subtotal.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping Fee</span>
                                <span>N${SHIPPING_FEE.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border mt-2">
                                <span>Total</span>
                                <span className="text-primary">N${total.toFixed(0)}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 space-y-1">
                            <p className="text-sm text-primary font-medium text-center">
                                No payment gateway—orders go straight to WhatsApp.
                            </p>
                            <p className="text-xs text-muted-foreground text-center">
                                After you tap the button, WhatsApp will open with your order summary. Send the message to the seller to confirm and arrange payment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default Checkout;
