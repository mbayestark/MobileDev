import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const login = mutation({
  args: {
    studentId: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
      .first();

    if (existing) {
      if (existing.password !== args.password) {
        throw new Error("Invalid password");
      }
      return { userId: existing._id, isAdmin: existing.isAdmin };
    }

    const userId = await ctx.db.insert("users", {
      studentId: args.studentId,
      password: args.password,
      name: args.studentId,
      role: "student",
      isAdmin: false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, isAdmin: false };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserByStudentId = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
      .first();
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    major: v.optional(v.string()),
    year: v.optional(
      v.union(
        v.literal("1st"),
        v.literal("2nd"),
        v.literal("3rd"),
        v.literal("4th")
      )
    ),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...fields } = args;
    const updates: Record<string, any> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(userId, updates);
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const setAdmin = mutation({
  args: {
    userId: v.id("users"),
    isAdmin: v.boolean(),
    adminLevel: v.optional(
      v.union(v.literal("super"), v.literal("standard"))
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isAdmin: args.isAdmin,
      adminLevel: args.isAdmin ? (args.adminLevel ?? "standard") : undefined,
      updatedAt: Date.now(),
    });
  },
});

export const savePushToken = mutation({
  args: {
    userId: v.id("users"),
    pushToken: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { pushToken: args.pushToken });
  },
});

export const deactivateUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});
