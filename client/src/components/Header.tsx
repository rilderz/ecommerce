import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard, Sparkles } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const cartItemCount = cartQuery.data?.items.length || 0;

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/70 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <Sparkles className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-foreground leading-none">Luxe</h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">Curated</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => navigate("/products")}
            className="text-foreground hover:text-accent transition-colors font-medium"
          >
            Shop
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="text-foreground hover:text-accent transition-colors flex items-center gap-2 font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          {isAuthenticated && (
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:text-accent transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-semibold shadow-md">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* Auth */}
          {!isAuthenticated ? (
            <a href={getLoginUrl()}>
              <Button className="hidden sm:inline-flex bg-accent hover:opacity-90 text-accent-foreground font-semibold">
                Sign In
              </Button>
            </a>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate("/account")}
                className="text-sm text-foreground hover:text-accent transition-colors font-medium"
              >
                {user?.name || "Account"}
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-muted rounded-lg transition-colors group"
              >
                <LogOut className="w-4 h-4 group-hover:text-accent transition-colors" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container py-4 flex flex-col gap-4">
            <button
              onClick={() => {
                navigate("/products");
                setIsOpen(false);
              }}
              className="text-foreground hover:text-accent transition-colors text-left font-medium"
            >
              Shop
            </button>
            {user?.role === "admin" && (
              <button
                onClick={() => {
                  navigate("/admin");
                  setIsOpen(false);
                }}
                className="text-foreground hover:text-accent transition-colors text-left flex items-center gap-2 font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </button>
            )}
            {isAuthenticated && (
              <>
                <button
                  onClick={() => {
                    navigate("/account");
                    setIsOpen(false);
                  }}
                  className="text-foreground hover:text-accent transition-colors text-left font-medium"
                >
                  My Account
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-foreground hover:text-accent transition-colors text-left flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button className="w-full bg-accent hover:opacity-90 text-accent-foreground font-semibold">
                  Sign In
                </Button>
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
