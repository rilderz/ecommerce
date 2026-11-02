import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, LogOut, Menu, X, LayoutDashboard, Sparkles } from "lucide-react";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // If not admin redirect
  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } bg-card border-r border-border transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/70 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">Luxe</h2>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-all text-left group"
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0 group-hover:text-accent transition-colors" />
            {sidebarOpen && <span className="group-hover:text-accent transition-colors">Dashboard</span>}
          </button>
          <button
            onClick={() => navigate("/admin/products")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-all text-left group"
          >
            <Package className="w-5 h-5 flex-shrink-0 group-hover:text-accent transition-colors" />
            {sidebarOpen && <span className="group-hover:text-accent transition-colors">Products</span>}
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-all text-left group"
          >
            <ShoppingBag className="w-5 h-5 flex-shrink-0 group-hover:text-accent transition-colors" />
            {sidebarOpen && <span className="group-hover:text-accent transition-colors">Orders</span>}
          </button>
        </nav>

        {/* User Information*/}
        {sidebarOpen && (
          <div className="p-4 border-t border-border bg-accent/5 rounded-lg m-4">
            <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="bg-card border-b border-border sticky top-0 z-40 px-8 py-4">
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
