import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock, Truck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Checkout() {
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingCountry: "",
  });

  const cartQuery = trpc.cart.get.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.shippingAddress || !formData.shippingCity || !formData.shippingState || !formData.shippingZip || !formData.shippingCountry) {
      toast.error("Please fill in all shipping fields");
      return;
    }

    setIsProcessing(true);
    try {
      const order = await createOrderMutation.mutateAsync(formData);
      
      // In a real implementation, you would redirect to Stripe here
      // For now, we'll simulate payment and redirect to confirmation
      toast.success("Order created successfully!");
      navigate(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  const total = cartQuery.data?.total || 0;
  const items = cartQuery.data?.items || [];

  if (items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Button onClick={() => navigate("/products")} className="bg-accent hover:opacity-90">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        {/* Header */}
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-12 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <h1 className="mb-12 text-foreground">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-card border border-border rounded-lg p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">Shipping Address</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      Street Address
                    </label>
                    <Input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      required
                      className="border-border focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">
                        City
                      </label>
                      <Input
                        type="text"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                        placeholder="New York"
                        required
                        className="border-border focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">
                        State
                      </label>
                      <Input
                        type="text"
                        name="shippingState"
                        value={formData.shippingState}
                        onChange={handleInputChange}
                        placeholder="NY"
                        required
                        className="border-border focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">
                        ZIP Code
                      </label>
                      <Input
                        type="text"
                        name="shippingZip"
                        value={formData.shippingZip}
                        onChange={handleInputChange}
                        placeholder="10001"
                        required
                        className="border-border focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">
                        Country
                      </label>
                      <Input
                        type="text"
                        name="shippingCountry"
                        value={formData.shippingCountry}
                        onChange={handleInputChange}
                        placeholder="United States"
                        required
                        className="border-border focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-card border border-border rounded-lg p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">Payment Method</h3>
                </div>
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Secure payment processing powered by industry-leading encryption.
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Stripe payment integration will be processed here in production.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing}
                size="lg"
                className="w-full bg-accent hover:opacity-90 text-accent-foreground font-semibold py-3 rounded-lg"
              >
                {isProcessing ? "Processing..." : "Complete Order"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-8 sticky top-24">
              <h3 className="font-semibold mb-8 text-foreground text-lg">Order Summary</h3>

              {/* Items */}
              <div className="space-y-4 mb-8 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-foreground">
                      ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">Calculated</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-lg text-accent">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
