import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Leaf } from "lucide-react";
import heroProducts from "@/assets/products/hero-products.png";

const Hero = () => {
    return (
        <section className="relative bg-gradient-to-br from-sage-light via-cream to-beige overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
            <div className="container py-10 md:py-16 relative">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-fade-in">
                        <div className="space-y-2">
                            <Badge variant="secondary" className="mb-4">
                                ✨ New Collection Available
                            </Badge>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                                Beauty Inspired
                                <br />
                                <span className="italic text-sage">by Real Life</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed mt-6">
                                Discover our carefully curated collection of natural,
                                sustainable beauty products that celebrate your authentic
                                self.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/products">
                                <Button
                                    size="lg"
                                    className="rounded-full bg-sage hover:bg-sage-dark text-white px-8 py-6 text-lg font-medium group"
                                >
                                    Shop Collection
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/about">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-full border-sage text-sage hover:bg-sage hover:text-white px-8 py-6 text-lg"
                                >
                                    Our Story
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-8 pt-4">
                            <div className="text-center">
                                <p className="font-display text-3xl font-bold text-sage">
                                    10K+
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Happy Customers
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="font-display text-3xl font-bold text-sage">
                                    100%
                                </p>
                                <p className="text-sm text-muted-foreground">Natural</p>
                            </div>
                            <div className="text-center">
                                <p className="font-display text-3xl font-bold text-sage">
                                    4.9
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="h-3 w-3 fill-amber-400 text-amber-400"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="relative animate-scale-in"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-sage/20 to-transparent rounded-full blur-3xl" />
                        <img
                            src={heroProducts}
                            alt="Natural beauty products"
                            className="w-full max-w-lg mx-auto rounded-full relative z-10"
                        />
                        <div
                            className="absolute -bottom-6 -right-6 bg-white rounded-full p-4 shadow-xl animate-bounce"
                            style={{ animationDelay: "1s" }}
                        >
                            <Leaf className="h-8 w-8 text-sage" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
