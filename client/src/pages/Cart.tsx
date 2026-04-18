import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Cart() {
  const [, navigate] = useLocation();
  const cartQuery = trpc.cart.get.useQuery();
  const updateItemMutation = trpc.cart.updateItem.useMutation();
  const removeItemMutation = trpc.cart.removeItem.useMutation();

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    try {
      await updateItemMutation.mutateAsync({ productId, quantity });
      cartQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeItemMutation.mutateAsync({ productId });
      toast.success("Item removed from cart");
      cartQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    }
  };

  if (cartQuery.isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const items = cartQuery.data?.items || [];
  const total = cartQuery.data?.total || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>
          <h1 className="text-foreground">Shopping Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground mb-8">Your cart is empty</p>
            <Button
              onClick={() => navigate("/products")}
              className="bg-accent hover:opacity-90 text-accent-foreground font-semibold px-8 py-3 rounded-lg"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-6 p-6 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="w-28 h-28 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center border border-border overflow-hidden">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-muted-foreground text-sm">No image</div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold mb-2 text-foreground line-clamp-2">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ${parseFloat(item.product.price).toFixed(2)} each
                        </p>
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center gap-2 w-fit">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-3 py-2 hover:bg-muted rounded transition-colors font-semibold"
                        >
                          −
                        </button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.productId,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-16 text-center border-border font-semibold"
                        />
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.productId, item.quantity + 1)
                          }
                          className="px-3 py-2 hover:bg-muted rounded transition-colors font-semibold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <p className="font-bold text-lg text-accent">
                        ${(
                          parseFloat(item.product.price) * item.quantity
                        ).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-8 sticky top-24">
                <h3 className="font-semibold mb-8 text-foreground text-lg">Order Summary</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-lg text-accent">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/checkout")}
                  size="lg"
                  className="w-full bg-accent hover:opacity-90 text-accent-foreground font-semibold py-3 flex items-center justify-center gap-2 rounded-lg mb-3"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/products")}
                  size="lg"
                  className="w-full border-border hover:bg-muted font-semibold py-3 rounded-lg"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
