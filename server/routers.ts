import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== CATEGORIES ====================
  categories: router({
    list: publicProcedure.query(async () => {
      return db.getCategories();
    }),
  }),

  // ==================== PRODUCTS ====================
  products: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
        categoryId: z.number().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        if (input.search) {
          return db.searchProducts(input.search);
        }
        if (input.categoryId) {
          return db.getProductsByCategory(input.categoryId);
        }
        return db.getProducts(input.limit);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await db.getProductBySlug(input.slug);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }
        return product;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }
        return product;
      }),
  }),

  // ==================== CART ====================
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);
      const total = items.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
      return { items, total };
    }),

    addItem: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }
        if (input.quantity > parseInt(product.stock.toString())) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient stock' });
        }
        await db.addToCart(ctx.user.id, input.productId, input.quantity);
        return db.getCartItems(ctx.user.id);
      }),

    updateItem: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }
        if (input.quantity > 0 && input.quantity > parseInt(product.stock.toString())) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient stock' });
        }
        await db.updateCartItem(ctx.user.id, input.productId, input.quantity);
        return db.getCartItems(ctx.user.id);
      }),

    removeItem: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFromCart(ctx.user.id, input.productId);
        return db.getCartItems(ctx.user.id);
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ==================== ORDERS ====================
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        if (order.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),

    create: protectedProcedure
      .input(z.object({
        shippingAddress: z.string(),
        shippingCity: z.string(),
        shippingState: z.string(),
        shippingZip: z.string(),
        shippingCountry: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const cartItems = await db.getCartItems(ctx.user.id);
        if (cartItems.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' });
        }

        // Validate stock for all items before creating order
        for (const cartItem of cartItems) {
          if (cartItem.quantity > parseInt(cartItem.product.stock.toString())) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Insufficient stock for ${cartItem.product.name}`,
            });
          }
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);

        const order = await db.createOrder({
          userId: ctx.user.id,
          totalAmount: totalAmount.toFixed(2),
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingState: input.shippingState,
          shippingZip: input.shippingZip,
          shippingCountry: input.shippingCountry,
        });

        for (const cartItem of cartItems) {
          await db.createOrderItem({
            orderId: order.id,
            productId: cartItem.productId,
            productName: cartItem.product.name,
            productPrice: cartItem.product.price,
            quantity: cartItem.quantity,
          });

          // Decrement product stock
          const newStock = parseInt(cartItem.product.stock.toString()) - cartItem.quantity;
          await db.updateProduct(cartItem.productId, { stock: newStock });
        }

        // Clear cart after successful order
        await db.clearCart(ctx.user.id);

        return order;
      }),
  }),

  // ==================== ADMIN: PRODUCTS ====================
  adminProducts: router({
    list: adminProcedure.query(async () => {
      return db.getProducts();
    }),

    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        price: z.string(),
        categoryId: z.number(),
        imageUrl: z.string().optional(),
        stock: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.createProduct(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().nullable().optional(),
        price: z.string().optional(),
        categoryId: z.number().optional(),
        imageUrl: z.string().nullable().optional(),
        stock: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ==================== ADMIN: ORDERS ====================
  adminOrders: router({
    list: adminProcedure.query(async () => {
      return db.getAllOrders();
    }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
      }))
      .mutation(async ({ input }) => {
        return db.updateOrderStatus(input.id, input.status);
      }),
  }),
});

export type AppRouter = typeof appRouter;
