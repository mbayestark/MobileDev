import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByBarcode = query({
  args: { barcode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("facilities")
      .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
      .first();
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("facilities").collect();
  },
});

export const enter = mutation({
  args: {
    userId: v.id("users"),
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activeOccupancy", {
      facilityId: args.facilityId,
      userId: args.userId,
      entryTime: Date.now(),
    });

    await ctx.db.insert("scans", {
      userId: args.userId,
      facilityId: args.facilityId,
      action: "entry",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const exit = mutation({
  args: {
    userId: v.id("users"),
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const occupancy = await ctx.db
      .query("activeOccupancy")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const record = occupancy.find((o) => o.facilityId === args.facilityId);

    if (!record) {
      throw new Error("You are not currently in this facility");
    }

    const duration = Date.now() - record.entryTime;

    await ctx.db.delete(record._id);

    await ctx.db.insert("scans", {
      userId: args.userId,
      facilityId: args.facilityId,
      action: "exit",
      timestamp: Date.now(),
      duration,
    });

    return { success: true, duration };
  },
});

export const getOccupancy = query({
  args: { facilityId: v.id("facilities") },
  handler: async (ctx, args) => {
    const occupants = await ctx.db
      .query("activeOccupancy")
      .withIndex("by_facilityId", (q) => q.eq("facilityId", args.facilityId))
      .collect();

    return occupants.length;
  },
});

export const getUserOccupancy = query({
  args: { userId: v.id("users"), facilityId: v.id("facilities") },
  handler: async (ctx, args) => {
    const occupancy = await ctx.db
      .query("activeOccupancy")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return occupancy.find((o) => o.facilityId === args.facilityId) ?? null;
  },
});

export const getAllOccupancy = query({
  handler: async (ctx) => {
    const facilities = await ctx.db.query("facilities").collect();
    const results = [];

    for (const facility of facilities) {
      const occupants = await ctx.db
        .query("activeOccupancy")
        .withIndex("by_facilityId", (q) => q.eq("facilityId", facility._id))
        .collect();

      results.push({
        ...facility,
        currentOccupancy: occupants.length,
      });
    }

    return results;
  },
});
