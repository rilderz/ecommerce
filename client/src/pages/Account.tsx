import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Account() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const ordersQuery = trpc.orders.list.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-2 text-foreground">My Account</h1>
          <p className="text-muted-foreground">Manage your profile and orders</p>
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="font-semibold mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Name
                  </label>
                  <p className="text-lg">{user?.name || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email
                  </label>
                  <p className="text-lg">{user?.email || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Account Type
                  </label>
                  <p className="text-lg capitalize">
                    {user?.role === "admin" ? "Administrator" : "Customer"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Member Since
                  </label>
                  <p className="text-lg">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/products")}
              className="w-full flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="mb-8 text-foreground">Order History</h2>

          {ordersQuery.isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse h-24 bg-muted rounded-lg" />
              ))}
            </div>
          ) : ordersQuery.data?.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Button onClick={() => navigate("/products")}>
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {ordersQuery.data?.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/order-confirmation/${order.id}`)}
                  className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors cursor-pointer"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Order ID */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Order ID
                      </p>
                      <p className="font-semibold">#{order.id}</p>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Date
                      </p>
                      <p className="font-semibold">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-600"
                              : order.status === "shipped"
                              ? "bg-blue-600"
                              : order.status === "processing"
                              ? "bg-yellow-600"
                              : "bg-gray-600"
                          }`}
                        />
                        <span className="font-semibold capitalize">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Total
                      </p>
                      <p className="font-bold text-lg text-accent">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
