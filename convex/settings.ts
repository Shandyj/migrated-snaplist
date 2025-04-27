import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    return await ctx.db
      .query("settings")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();
  }
});

export const save = mutation({
  args: {
    geminiPrompt: v.optional(v.string()),
    previousItems: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("settings", {
        userId,
        ...args,
      });
    }
  }
});
