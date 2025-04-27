import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  stores: defineTable({
    name: v.string(),
    order: v.number(),
    userId: v.id("users"),
    isExpanded: v.boolean(),
  }).index("by_user", ["userId"]),
  
  items: defineTable({
    name: v.string(),
    quantity: v.optional(v.string()),
    completed: v.boolean(),
    storeId: v.id("stores"),
    userId: v.id("users"),
    order: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_user", ["userId"]),

  settings: defineTable({
    userId: v.id("users"),
    geminiPrompt: v.optional(v.string()),
    previousItems: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
