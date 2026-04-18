import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();
  const orderQuery = trpc.orders.getById.useQuery({ id: parseInt(orderId!) });

  if (orderQuery.isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse text-center">
          <div className="h-12 bg-muted rounded w-1/4 mx-auto mb-4" />
          <div className="h-6 bg-muted rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!orderQuery.data) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground mb-4">Order not found</p>
        <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
      </div>
    );
  }

  const order = orderQuery.data;

  return (
    <div className="min-h-screen">
      <div className="container py-12">
        {/* Success Message */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="mb-4 text-foreground">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <p className="text-sm text-muted-foreground">
            Order ID: <span className="font-mono font-semibold">#{order.id}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Shipping Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Shipping Address</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="capitalize font-medium">{order.status}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-accent">${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="max-w-4xl mx-auto mb-12">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between p-4 bg-card border border-border rounded-lg">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  ${(parseFloat(item.productPrice) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground mb-6">
            You will receive an email confirmation shortly. You can track your order status in your account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/account")}
              className="flex items-center justify-center gap-2"
            >
              View My Orders
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => navigate("/products")}
              variant="outline"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
