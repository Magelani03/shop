import * as React from "react";
import { Leaf, Shield, Truck, Award } from "lucide-react";

const BrandValues = () => {
    const values = [
        {
            icon: Leaf,
            title: "100% Natural",
            desc: "Organic ingredients only",
        },
        {
            icon: Shield,
            title: "Dermatologist Tested",
            desc: "Safe for all skin types",
        },
        {
            icon: Truck,
            title: "Free Shipping",
            desc: "On orders over $50",
        },
        {
            icon: Award,
            title: "Award Winning",
            desc: "Recognized quality",
        },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {values.map((item, index) => (
                        <div
                            key={index}
                            className="text-center group animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-light rounded-full mb-4 group-hover:bg-sage transition-colors">
                                <item.icon className="h-8 w-8 text-sage group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="font-display text-lg font-semibold mb-2">
                                {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrandValues;
