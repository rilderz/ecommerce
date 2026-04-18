import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
function createMockContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Products Router", () => {
  it("should list products", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    const products = await caller.products.list({});
    expect(Array.isArray(products)).toBe(true);
  });

  it("should get product by slug", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    try {
      const product = await caller.products.getBySlug({ slug: "test-product" });
      expect(product).toBeDefined();
    } catch (error: any) {
      // Product might not exist, which is fine for this test
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("should get product by id", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    try {
      const product = await caller.products.getById({ id: 999 });
      expect(product).toBeDefined();
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });
});

describe("Cart Router", () => {
  it("should get empty cart for new user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    const cart = await caller.cart.get();
    expect(cart).toBeDefined();
    expect(Array.isArray(cart.items)).toBe(true);
    expect(typeof cart.total).toBe("number");
  });

  it("should require authentication for cart operations", async () => {
    const ctx = createMockContext();
    ctx.user = null as any;
    const caller = appRouter.createCaller(ctx);
    
    try {
      await caller.cart.get();
      expect.fail("Should require authentication");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });
});

describe("Orders Router", () => {
  it("should list user orders", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    const orders = await caller.orders.list();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("should require authentication for orders", async () => {
    const ctx = createMockContext();
    ctx.user = null as any;
    const caller = appRouter.createCaller(ctx);
    
    try {
      await caller.orders.list();
      expect.fail("Should require authentication");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });
});

describe("Admin Products Router", () => {
  it("should require admin role", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);
    
    try {
      await caller.adminProducts.list();
      expect.fail("Should require admin role");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to list products", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    
    const products = await caller.adminProducts.list();
    expect(Array.isArray(products)).toBe(true);
  });
});

describe("Admin Orders Router", () => {
  it("should require admin role", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);
    
    try {
      await caller.adminOrders.list();
      expect.fail("Should require admin role");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to list all orders", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    
    const orders = await caller.adminOrders.list();
    expect(Array.isArray(orders)).toBe(true);
  });
});

describe("Categories Router", () => {
  it("should list categories", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    const categories = await caller.categories.list();
    expect(Array.isArray(categories)).toBe(true);
  });
});

describe("Auth Router", () => {
  it("should get current user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
  });

  it("should logout user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
