import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
    const navigate = useNavigate();
    const {
        items,
        updateQuantity,
        removeFromCart,
        getTotalPrice,
        isDrawerOpen,
        setDrawerOpen
    } = useCartStore();

    const handleCheckout = () => {
        setDrawerOpen(false);
        navigate("/cart");
    };

    return (
        <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
            <SheetContent className="w-full sm:max-w-md bg-background border-l border-border flex flex-col p-0">
                <SheetHeader className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2 font-display text-2xl">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                            Your Cart
                        </SheetTitle>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">Your cart is empty</h3>
                                <p className="text-sm text-muted-foreground">Add some products to get started</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setDrawerOpen(false)}
                                className="rounded-full"
                            >
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 group">
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-foreground line-clamp-1">{item.name}</h4>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-muted-foreground uppercase tracking-tight">{item.category}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <span className="font-bold">N${(item.price * item.quantity).toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <SheetFooter className="p-6 border-t border-border bg-muted/30 pt-4 flex-col sm:flex-col items-stretch space-x-0">
                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Subtotal</span>
                                <span>N${getTotalPrice().toFixed(0)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Shipping and taxes calculated at checkout
                            </p>
                            <Button
                                onClick={handleCheckout}
                                className="w-full h-12 text-lg rounded-full bg-primary hover:bg-primary/90"
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
