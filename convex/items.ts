import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByBarcode = query({
  args: { barcode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
      .first();
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("items").collect();
  },
});

export const checkout = mutation({
  args: {
    userId: v.id("users"),
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item || item.status !== "available") {
      throw new Error("Item is not available for checkout");
    }

    await ctx.db.patch(args.itemId, { status: "in_use" });

    await ctx.db.insert("activeCheckouts", {
      itemId: args.itemId,
      userId: args.userId,
      checkoutTime: Date.now(),
      expectedReturnTime: Date.now() + 2 * 60 * 60 * 1000,
    });

    await ctx.db.insert("scans", {
      userId: args.userId,
      itemId: args.itemId,
      action: "checkout",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const returnItem = mutation({
  args: {
    userId: v.id("users"),
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    const activeCheckout = await ctx.db
      .query("activeCheckouts")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .first();

    if (!activeCheckout) {
      throw new Error("No active checkout found for this item");
    }

    const duration = Date.now() - activeCheckout.checkoutTime;

    await ctx.db.patch(args.itemId, { status: "available" });
    await ctx.db.delete(activeCheckout._id);

    await ctx.db.insert("scans", {
      userId: args.userId,
      itemId: args.itemId,
      action: "return",
      timestamp: Date.now(),
      duration,
    });

    return { success: true, duration };
  },
});

export const getActiveCheckouts = query({
  handler: async (ctx) => {
    const checkouts = await ctx.db.query("activeCheckouts").collect();
    const results = [];

    for (const checkout of checkouts) {
      const item = await ctx.db.get(checkout.itemId);
      const user = await ctx.db.get(checkout.userId);
      results.push({
        ...checkout,
        itemName: item?.name ?? "Unknown",
        itemBarcode: item?.barcode ?? "",
        userName: user?.name ?? "Unknown",
        userProfile: user ? {
          _id: user._id,
          name: user.name,
          studentId: user.studentId,
          email: user.email,
          phone: user.phone,
          role: user.role,
          major: user.major,
          year: user.year,
          department: user.department,
          position: user.position,
        } : null,
      });
    }

    return results;
  },
});

export const getAllWithWeeklyStats = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("items").collect();
    const now = Date.now();
    const today = new Date(now);
    const dayOfWeek = today.getDay();
    // Start of week (Monday)
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartMs = weekStart.getTime();

    const results = [];

    for (const item of items) {
      // Get all scans for this item this week
      const scans = await ctx.db
        .query("scans")
        .order("desc")
        .collect();

      const itemScans = scans.filter(
        (s) => s.itemId === item._id && s.timestamp >= weekStartMs
      );

      // Track which days had activity (0=Mon, 6=Sun)
      const daysUsed: boolean[] = [false, false, false, false, false, false, false];

      for (const scan of itemScans) {
        const scanDate = new Date(scan.timestamp);
        const scanDay = scanDate.getDay();
        const index = scanDay === 0 ? 6 : scanDay - 1;
        if (scan.action === "checkout" || scan.action === "return") {
          daysUsed[index] = true;
        }
      }

      // Get who currently has it
      const activeCheckout = await ctx.db
        .query("activeCheckouts")
        .withIndex("by_itemId", (q) => q.eq("itemId", item._id))
        .first();

      let checkedOutBy = null;
      if (activeCheckout) {
        const user = await ctx.db.get(activeCheckout.userId);
        checkedOutBy = {
          userId: activeCheckout.userId,
          name: user?.name ?? "Unknown",
          studentId: user?.studentId ?? "",
          email: user?.email,
          phone: user?.phone,
          role: user?.role ?? "student",
          major: user?.major,
          year: user?.year,
          since: activeCheckout.checkoutTime,
        };
      }

      const totalCheckoutsThisWeek = itemScans.filter(
        (s) => s.action === "checkout"
      ).length;

      results.push({
        ...item,
        daysUsed,
        checkedOutBy,
        totalCheckoutsThisWeek,
      });
    }

    return results;
  },
});

export const getItemCurrentHolder = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const checkout = await ctx.db
      .query("activeCheckouts")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .first();

    if (!checkout) return null;

    const user = await ctx.db.get(checkout.userId);
    if (!user) return null;

    return {
      userId: checkout.userId,
      name: user.name,
      studentId: user.studentId,
      email: user.email,
      phone: user.phone,
      role: user.role,
      major: user.major,
      year: user.year,
      department: user.department,
      position: user.position,
      since: checkout.checkoutTime,
    };
  },
});

export const getUserActiveCheckout = query({
  args: { userId: v.id("users"), itemId: v.id("items") },
  handler: async (ctx, args) => {
    const checkouts = await ctx.db
      .query("activeCheckouts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return checkouts.find((c) => c.itemId === args.itemId) ?? null;
  },
});
