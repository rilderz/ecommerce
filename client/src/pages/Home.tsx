import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [, navigate] = useLocation();
  const productsQuery = trpc.products.list.useQuery({ limit: 6 });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-40 bg-gradient-to-br from-background via-card to-background overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm font-semibold text-accent uppercase tracking-widest">
                Luxury Curated
              </span>
            </div>
            <h1 className="mb-8 text-foreground leading-tight">
              Discover Exceptional Craftsmanship
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Experience a carefully curated collection of premium products, each selected for its superior quality, timeless design, and exceptional craftsmanship. Shop with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate("/products")}
                className="bg-accent hover:opacity-90 text-accent-foreground font-semibold px-8 py-3 flex items-center gap-2 rounded-lg"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/products")}
                className="font-semibold px-8 py-3 rounded-lg border-border hover:bg-muted"
              >
                View All Products
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Free Shipping</h4>
                <p className="text-sm text-muted-foreground">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Secure Checkout</h4>
                <p className="text-sm text-muted-foreground">Protected payments</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Easy Returns</h4>
                <p className="text-sm text-muted-foreground">30-day guarantee</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Premium Quality</h4>
                <p className="text-sm text-muted-foreground">Curated selection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-accent rounded-full" />
              <h2 className="text-foreground">Featured Collection</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Handpicked selections showcasing the finest items in our catalog
            </p>
          </div>

          {productsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productsQuery.data?.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.slug}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg bg-muted aspect-square mb-4 flex items-center justify-center border border-border hover:border-accent transition-colors">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-muted-foreground">No image</div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-accent">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button
              onClick={() => navigate("/products")}
              variant="outline"
              className="font-semibold px-8 py-3 rounded-lg border-border hover:bg-muted"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-r from-accent/5 to-accent/10 border-y border-border">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="mb-6 text-foreground">Join Our Exclusive Community</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Subscribe to receive updates on new collections, exclusive offers, and curated recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button className="bg-accent hover:opacity-90 text-accent-foreground font-semibold px-8 py-3 rounded-lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
