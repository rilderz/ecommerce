import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShoppingCart, Check, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const productQuery = trpc.products.getBySlug.useQuery({ slug: slug! });
  const addToCartMutation = trpc.cart.addItem.useMutation();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    if (!productQuery.data) return;

    setIsAdding(true);
    try {
      await addToCartMutation.mutateAsync({
        productId: productQuery.data.id,
        quantity,
      });
      toast.success("Added to cart!");
      setQuantity(1);
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  if (productQuery.isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-muted rounded-lg" />
            <div>
              <div className="h-8 bg-muted rounded mb-4" />
              <div className="h-6 bg-muted rounded w-1/3 mb-8" />
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!productQuery.data) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Button onClick={() => navigate("/products")} className="bg-accent hover:opacity-90">
          Back to Products
        </Button>
      </div>
    );
  }

  const product = productQuery.data;
  const isOutOfStock = parseInt(product.stock.toString()) === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-12 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        {/* Product */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
          {/* Image */}
          <div className="flex items-center justify-center bg-muted rounded-lg aspect-square border border-border overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="text-muted-foreground">No image available</div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-start">
            <div className="mb-6">
              <h1 className="mb-4 text-foreground">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-accent text-accent"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(24 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-border">
              <p className="text-4xl font-bold text-accent">
                ${parseFloat(product.price).toFixed(2)}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3 mb-8 p-4 bg-accent/5 rounded-lg border border-accent/10">
              {isOutOfStock ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="font-medium text-destructive">Out of Stock</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 text-accent" />
                  <span className="font-medium text-accent">In Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-10">
                <h3 className="font-semibold mb-3 text-foreground">About This Product</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart */}
            {!isOutOfStock && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-semibold text-foreground">Quantity:</label>
                  <div className="flex items-center border border-border rounded-lg bg-card">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-muted transition-colors font-semibold"
                    >
                      −
                    </button>
                    <Input
                      type="number"
                      min="1"
                      max={parseInt(product.stock.toString())}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-20 border-0 text-center font-semibold"
                    />
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            parseInt(product.stock.toString()),
                            quantity + 1
                          )
                        )
                      }
                      className="px-4 py-2 hover:bg-muted transition-colors font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  size="lg"
                  className="w-full bg-accent hover:opacity-90 text-accent-foreground font-semibold py-3 flex items-center justify-center gap-2 rounded-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAdding ? "Adding to Cart..." : "Add to Cart"}
                </Button>
              </div>
            )}

            {isOutOfStock && (
              <Button
                disabled
                size="lg"
                className="w-full opacity-50 py-3 rounded-lg"
              >
                Out of Stock
              </Button>
            )}

            {/* Additional Info */}
            <div className="mt-12 pt-8 border-t border-border space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SKU:</span>
                <span className="font-medium">{product.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{product.categoryId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
