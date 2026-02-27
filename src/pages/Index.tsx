import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import {
  Mail,
  ArrowRight,
  Instagram,
} from "lucide-react";
import Hero from "@/components/home/Hero";
import BrandValues from "@/components/home/BrandValues";
import heroProducts from "@/assets/products/hero-products.png";
import serumNew from "@/assets/products/serum-new.jpg";
import skincareSet from "@/assets/products/skincare-set.jpg";
import featuredProducts from "@/assets/products/featured-products.jpg";
import creamJar from "@/assets/products/cream-jar.jpg";
import bodyButter from "@/assets/products/body-butter.jpg";
import perfumeBottle from "@/assets/products/perfume-bottle.jpg";
import diffuser from "@/assets/products/diffuser.png";
import { Star, Quote } from "lucide-react";

const Index = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const featuredProductsList = (products ?? []).slice(0, 4);
  const bestSellers = (products ?? []).slice(4, 8);

  return (
    <Layout>
      <Hero />
      <BrandValues />

      {/* Product Categories */}
      <section className="py-20 bg-gradient-to-b from-white to-sage-light/30">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully curated categories designed for every
              aspect of your beauty routine
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                image: creamJar,
                title: "Skincare",
                count: "25+ products",
                link: "/products?category=skincare",
              },
              {
                image: bodyButter,
                title: "Body Care",
                count: "18+ products",
                link: "/products?category=body",
              },
              {
                image: perfumeBottle,
                title: "Fragrance",
                count: "12+ products",
                link: "/products?category=fragrance",
              },
              {
                image: diffuser,
                title: "Wellness",
                count: "15+ products",
                link: "/products?category=wellness",
              },
            ].map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2">
                  <div className="relative overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-display text-xl font-bold">
                        {category.title}
                      </h3>
                      <p className="text-sm opacity-90">{category.count}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground">
              Our most loved products, carefully selected just for you
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, index) => (
                <div key={index}>
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredProductsList.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {isError && !isLoading && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">
                Failed to load featured products
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}

          <div className="text-center">
            <Link to="/products">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-sage text-sage hover:bg-sage hover:text-white"
              >
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Section */}
      <section className="py-20 bg-gradient-to-r from-sage-light to-cream">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src={serumNew}
                alt="New and Improved Serum C+"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <Badge className="mb-3 bg-white text-sage">NEW LAUNCH</Badge>
                  <h3 className="font-display text-3xl font-bold mb-2">
                    New and Improved
                  </h3>
                  <p className="text-2xl mb-4">Serum C+</p>
                  <Button className="bg-white text-sage hover:bg-sage hover:text-white">
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src={skincareSet}
                alt="Summer Sale"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <Badge className="mb-3 bg-red-500 text-white">
                    LIMITED TIME
                  </Badge>
                  <h3 className="font-display text-3xl font-bold mb-2">
                    Get up to 40% off
                  </h3>
                  <p className="text-2xl mb-4">this summer</p>
                  <Button className="bg-white text-sage hover:bg-sage hover:text-white">
                    Shop Sale
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Real reviews from real people who love our products
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                rating: 5,
                comment:
                  "Absolutely love the quality! My skin has never felt better. The natural ingredients make such a difference.",
                product: "Vitamin C Serum",
              },
              {
                name: "Maria Garcia",
                rating: 5,
                comment:
                  "Fast shipping and amazing customer service. The body butter is my new favorite - so moisturizing!",
                product: "Shea Body Butter",
              },
              {
                name: "Emily Chen",
                rating: 5,
                comment:
                  "Finally found products that don't irritate my sensitive skin. Thank you for being truly natural!",
                product: "Gentle Cleanser",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-sage mb-4" />
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Verified purchase • {testimonial.product}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-sage to-sage-dark">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in">
              <Mail className="h-16 w-16 text-white mx-auto mb-6" />
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Stay in the Loop
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Be the first to know about new products, exclusive offers, and
                beauty tips delivered straight to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70 rounded-full px-6 py-3"
                />
                <Button className="bg-white text-sage hover:bg-white/90 rounded-full px-8 py-3 font-semibold">
                  Subscribe
                </Button>
              </div>
              <p className="text-sm text-white/70 mt-4">
                * No spam, unsubscribe at any time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Instagram className="h-8 w-8 text-sage" />
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                @beautylife
              </h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Follow us for daily beauty inspiration and behind-the-scenes
              content
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              featuredProducts,
              creamJar,
              bodyButter,
              perfumeBottle,
              serumNew,
              skincareSet,
            ].map((image, index) => (
              <div
                key={index}
                className="aspect-square overflow-hidden rounded-2xl group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={image}
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-sage text-sage hover:bg-sage hover:text-white"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Follow Us
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Born from a passion for natural beauty, our brand celebrates the
                power of authentic ingredients and sustainable practices. We
                believe that true beauty comes from feeling confident in your
                own skin.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Every product is crafted with care, using only the finest
                natural ingredients sourced responsibly from around the world.
                Our mission is to help you discover your natural glow.
              </p>
              <Link to="/about">
                <Button
                  size="lg"
                  className="bg-sage hover:bg-sage-dark text-white rounded-full"
                >
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div
              className="relative animate-scale-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="absolute inset-0 bg-sage/10 rounded-3xl transform rotate-3" />
              <img
                src={featuredProducts}
                alt="Our story"
                className="relative w-full rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
