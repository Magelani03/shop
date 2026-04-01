import SidebarLayout from '@/components/layout/SidebarLayout';
import skincareSet from '@/assets/products/skincare-set.jpg';
import featuredProducts from '@/assets/products/featured-products.jpg';

const About = () => {
  return (
    <SidebarLayout>
      <div className="p-6 space-y-12">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">
              About Our Story
            </h1>
            <p className="text-lg text-muted-foreground">
              Founded with a passion for natural beauty, we believe that skincare 
              should be simple, effective, and kind to both your skin and the planet.
            </p>
            <p className="text-muted-foreground">
              Our products are crafted with the finest organic ingredients, sustainably 
              sourced from around the world. We're committed to creating formulas that 
              deliver real results without compromising on quality or ethics.
            </p>
          </div>
          <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <img
              src={skincareSet}
              alt="Our products"
              className="rounded-2xl shadow-lg"
            />
          </div>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <img
              src={featuredProducts}
              alt="Our collection"
              className="rounded-2xl shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground">
              We're on a mission to revolutionize the beauty industry by proving that 
              effective skincare doesn't have to come at a cost to our planet. Every 
              product we create is a step towards a more sustainable, more beautiful future.
            </p>
            <p className="text-muted-foreground">
              From our carefully selected ingredients to our eco-friendly packaging, 
              every detail is considered with both your skin and the environment in mind.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default About;
