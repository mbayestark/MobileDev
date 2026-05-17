import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUserHistory = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30;
    const allScans = await ctx.db
      .query("scans")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    const results = [];

    for (const scan of allScans) {
      let itemName = null;
      let facilityName = null;

      if (scan.itemId) {
        const item = await ctx.db.get(scan.itemId);
        itemName = item?.name ?? "Unknown Item";
      }
      if (scan.facilityId) {
        const facility = await ctx.db.get(scan.facilityId);
        facilityName = facility?.name ?? "Unknown Facility";
      }

      results.push({
        ...scan,
        itemName,
        facilityName,
      });
    }

    return results;
  },
});

export const getAuditTrail = query({
  args: {
    limit: v.optional(v.number()),
    actionFilter: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const allScans = await ctx.db
      .query("scans")
      .order("desc")
      .take(200);

    const results = [];

    for (const scan of allScans) {
      if (args.actionFilter && args.actionFilter !== "all") {
        if (scan.action !== args.actionFilter) continue;
      }

      const user = await ctx.db.get(scan.userId);
      let itemName = null;
      let facilityName = null;

      if (scan.itemId) {
        const item = await ctx.db.get(scan.itemId);
        itemName = item?.name ?? "Unknown Item";
      }
      if (scan.facilityId) {
        const facility = await ctx.db.get(scan.facilityId);
        facilityName = facility?.name ?? "Unknown Facility";
      }

      const userName = user?.name ?? "Unknown User";

      if (args.searchQuery) {
        const q = args.searchQuery.toLowerCase();
        const searchable = `${userName} ${itemName ?? ""} ${facilityName ?? ""}`.toLowerCase();
        if (!searchable.includes(q)) continue;
      }

      results.push({
        ...scan,
        userName,
        itemName,
        facilityName,
      });

      if (results.length >= limit) break;
    }

    return results;
  },
});

export const getDashboardStats = query({
  handler: async (ctx) => {
    const activeCheckouts = await ctx.db.query("activeCheckouts").collect();
    const activeOccupants = await ctx.db.query("activeOccupancy").collect();
    const allUsers = await ctx.db.query("users").collect();
    const allItems = await ctx.db.query("items").collect();

    const overdueCheckouts = activeCheckouts.filter((c) => {
      const twoHours = 2 * 60 * 60 * 1000;
      return Date.now() - c.checkoutTime > twoHours;
    });

    const overdueDetails = [];
    for (const checkout of overdueCheckouts) {
      const item = await ctx.db.get(checkout.itemId);
      const user = await ctx.db.get(checkout.userId);
      overdueDetails.push({
        itemName: item?.name ?? "Unknown",
        userName: user?.name ?? "Unknown",
        checkoutTime: checkout.checkoutTime,
      });
    }

    const allBookings = await ctx.db.query("bookings").collect();
    const activeBookings = allBookings.filter(
      (b) => b.status === "confirmed" || b.status === "in_progress"
    );
    const noShowBookings = allBookings.filter((b) => b.status === "no_show");

    return {
      itemsOut: activeCheckouts.length,
      totalOccupants: activeOccupants.length,
      totalUsers: allUsers.length,
      totalItems: allItems.length,
      overdueCount: overdueCheckouts.length,
      overdueItems: overdueDetails,
      activeBookings: activeBookings.length,
      totalNoShows: noShowBookings.length,
    };
  },
});
