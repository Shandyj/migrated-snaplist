import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("stores")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
  }
});

export const add = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const stores = await ctx.db
      .query("stores")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    return await ctx.db.insert("stores", {
      name: args.name,
      userId,
      order: stores.length,
      isExpanded: true,
    });
  }
});

export const remove = mutation({
  args: {
    id: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const store = await ctx.db.get(args.id);
    if (!store || store.userId !== userId) {
      throw new Error("Store not found");
    }

    await ctx.db.delete(args.id);
  }
});

export const toggleExpanded = mutation({
  args: {
    id: v.id("stores"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const store = await ctx.db.get(args.id);
    if (!store || store.userId !== userId) {
      throw new Error("Store not found");
    }

    await ctx.db.patch(args.id, {
      isExpanded: !store.isExpanded,
    });
  }
});

export const reorder = mutation({
  args: {
    id: v.id("stores"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const store = await ctx.db.get(args.id);
    if (!store || store.userId !== userId) {
      throw new Error("Store not found");
    }

    await ctx.db.patch(args.id, {
      order: args.newOrder,
    });
  }
});
