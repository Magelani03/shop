import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { Product, useCartStore, useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact";
}

const ProductCardSkeleton = ({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) => {
  if (variant === "compact") {
    return (
      <div className="animate-pulse">
        <div className="bg-muted/30 aspect-square rounded-2xl skeleton"></div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-square bg-muted skeleton"></div>
      <div className="p-4 space-y-2">
        <div className="h-6 bg-muted rounded skeleton"></div>
        <div className="h-4 bg-muted rounded w-3/4 skeleton"></div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-muted rounded skeleton"></div>
          <div className="h-4 w-12 bg-muted rounded skeleton"></div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-20 bg-muted rounded skeleton"></div>
          <div className="h-9 w-24 bg-muted rounded-full skeleton"></div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, variant = "default" }: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);

  const handleAddToCart = () => {
    const { isAuthenticated, setShowAuthModal } = useAuthStore.getState();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    addToCart(product);
    toast.success(`${product.name} added to cart`);
    setDrawerOpen(true);
  };

  if (variant === "compact") {
    return (
      <Link to={`/product/${product.id}`} className="group">
        <div className="product-card overflow-hidden rounded-2xl bg-muted/30">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>
    );
  }

  return (
    <div className="product-card group relative bg-card rounded-2xl overflow-hidden shadow-sm">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.discount && (
            <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded-full">
              {product.discount}% OFF
            </span>
          )}
          <button className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-lg font-medium text-foreground line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{product.rating}</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-xl font-semibold text-foreground">
            N$ {product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="rounded-full bg-primary hover:bg-primary/90"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
export { ProductCardSkeleton };
