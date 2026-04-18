import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, Users, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const productsQuery = trpc.adminProducts.list.useQuery();
  const ordersQuery = trpc.adminOrders.list.useQuery();

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground mb-4">
          You do not have permission to access this page.
        </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const totalProducts = productsQuery.data?.length || 0;
  const totalOrders = ordersQuery.data?.length || 0;
  const totalRevenue = ordersQuery.data?.reduce(
    (sum, order) => sum + parseFloat(order.totalAmount),
    0
  ) || 0;

  return (
    <AdminLayout>
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-2 text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage products and orders</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Products */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Products</h3>
              <Package className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold mb-2">{totalProducts}</p>
            <p className="text-sm text-muted-foreground">Total products in catalog</p>
          </div>

          {/* Orders */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Orders</h3>
              <ShoppingBag className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold mb-2">{totalOrders}</p>
            <p className="text-sm text-muted-foreground">Total orders received</p>
          </div>

          {/* Revenue */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Revenue</h3>
              <Users className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold mb-2">${totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total revenue</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Products Management */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="font-semibold mb-4">Products Management</h3>
            <p className="text-muted-foreground mb-6">
              Create, update, and delete products from your catalog.
            </p>
            <Button
              onClick={() => navigate("/admin/products")}
              className="flex items-center gap-2"
            >
              Manage Products
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Orders Management */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="font-semibold mb-4">Orders Management</h3>
            <p className="text-muted-foreground mb-6">
              View and update order statuses for customer orders.
            </p>
            <Button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-2"
            >
              Manage Orders
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
