import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("items")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
  }
});

export const add = mutation({
  args: {
    name: v.string(),
    quantity: v.optional(v.string()),
    storeId: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const items = await ctx.db
      .query("items")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .collect();

    return await ctx.db.insert("items", {
      name: args.name,
      quantity: args.quantity,
      storeId: args.storeId,
      userId,
      completed: false,
      order: items.length,
    });
  }
});

export const remove = mutation({
  args: {
    id: v.id("items"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found");
    }

    await ctx.db.delete(args.id);
  }
});

export const toggleComplete = mutation({
  args: {
    id: v.id("items"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found");
    }

    await ctx.db.patch(args.id, {
      completed: !item.completed,
    });
  }
});

export const reorder = mutation({
  args: {
    id: v.id("items"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found");
    }

    await ctx.db.patch(args.id, {
      order: args.newOrder,
    });
  }
});

export const moveToStore = mutation({
  args: {
    id: v.id("items"),
    newStoreId: v.id("stores"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found");
    }

    const store = await ctx.db.get(args.newStoreId);
    if (!store || store.userId !== userId) {
      throw new Error("Store not found");
    }

    await ctx.db.patch(args.id, {
      storeId: args.newStoreId,
      order: args.newOrder,
    });
  }
});
