import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SidebarLayout from '@/components/layout/SidebarLayout';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/lib/products';
import { getProducts } from '@/lib/api';
import featuredProducts from '@/assets/products/featured-products.jpg';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const filteredProducts = (products ?? []).filter((p) =>
    selectedCategory === 'All' ? true : p.category === selectedCategory,
  );

  return (
    <SidebarLayout>
      <div className="p-6 space-y-8">
        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-56">
          <img
            src={featuredProducts}
            alt="We have something for everyone"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sage/80 to-transparent flex items-center p-8">
            <div className="text-primary-foreground max-w-md">
              <h1 className="font-display text-2xl md:text-3xl font-bold italic leading-tight">
                We Have something for Everyone
              </h1>
              <p className="mt-2 text-lg opacity-90">
                It's not so much about the journey, it's the experience we care about.
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading && (
          <p className="text-center text-muted-foreground">Loading products...</p>
        )}
        {isError && !isLoading && (
          <p className="text-center text-destructive">Failed to load products.</p>
        )}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Products;
