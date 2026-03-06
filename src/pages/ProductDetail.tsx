import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { getProduct, getProducts } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const productId = Number(id);
  const addToCart = useCartStore((state) => state.addToCart);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: !Number.isNaN(productId),
  });

  const { data: allProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });

  const suggestedProducts = (allProducts ?? [])
    .filter((p) => p.id !== productId)
    .slice(0, 3);

  if (isProductLoading) {
    return (
      <SidebarLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </SidebarLayout>
    );
  }

  if (isProductError) {
    return (
      <SidebarLayout>
        <div className="p-6 text-center">
          <p className="text-destructive">Failed to load product.</p>
        </div>
      </SidebarLayout>
    );
  }

  if (!product) {
    return (
      <SidebarLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </SidebarLayout>
    );
  }

  const handleBuyNow = () => {
    const { isAuthenticated, setShowAuthModal } = useAuthStore.getState();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    addToCart(product);
    toast.success(`${product.name} added to cart`);
    setDrawerOpen(true);
  };

  return (
    <SidebarLayout>
      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Product */}
          <div className="lg:col-span-2">
            <div className="bg-primary rounded-3xl p-8 text-primary-foreground">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
                      {product.category}
                    </h2>
                    <h1 className="font-display text-3xl font-bold mt-1">
                      {product.name}
                    </h1>
                  </div>

                  <p className="text-primary-foreground/90 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{product.rating}</span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-display text-3xl font-bold">
                      N$ {product.price.toFixed(2)}
                    </p>
                    {product.discount && (
                      <p className="text-sm">
                        Get {product.discount}% off with purchases over N$500
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleBuyNow}
                    size="lg"
                    className="w-full md:w-auto bg-beige text-charcoal hover:bg-beige/90 rounded-full px-12 py-6 text-lg font-medium"
                  >
                    BUY NOW
                  </Button>
                </div>

                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Products */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-semibold">Suggested Products</h3>
            <div className="space-y-4">
              {suggestedProducts.map((p) => (
                <ProductCard key={p.id} product={p} variant="compact" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ProductDetail;
