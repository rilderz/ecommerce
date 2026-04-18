import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

export default function AdminOrders() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const ordersQuery = trpc.adminOrders.list.useQuery();
  const updateStatusMutation = trpc.adminOrders.updateStatus.useMutation();

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground mb-4">Access denied</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
      });
      toast.success("Order status updated");
      ordersQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
    }
  };

  const selectedOrder = ordersQuery.data?.find(o => o.id === selectedOrderId);

  return (
    <AdminLayout>
      <div className="container py-12">
        <h1 className="mb-8 text-foreground">Orders Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            {ordersQuery.isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-20 bg-muted rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {ordersQuery.data?.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`bg-card border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedOrderId === order.id
                        ? "border-accent"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Order #{order.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-accent">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </p>
                        <span className="text-xs capitalize font-medium">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h3 className="font-semibold mb-6">Order Details</h3>

                {/* Customer Info */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Customer
                  </p>
                  <p className="font-medium">Order #{selectedOrder.id}</p>
                </div>

                {/* Shipping Address */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Shipping Address
                  </p>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress}
                    <br />
                    {selectedOrder.shippingCity}, {selectedOrder.shippingState}{" "}
                    {selectedOrder.shippingZip}
                    <br />
                    {selectedOrder.shippingCountry}
                  </p>
                </div>

                {/* Status Update */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Update Status
                  </p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.id, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Total */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-accent">
                      ${parseFloat(selectedOrder.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
