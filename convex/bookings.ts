import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const checkItemAvailability = query({
  args: {
    itemId: v.id("items"),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    const activeStatuses = ["pending", "confirmed", "in_progress"];
    const conflicts = bookings.filter(
      (b) =>
        activeStatuses.includes(b.status) &&
        b.startTime < args.endTime &&
        b.endTime > args.startTime
    );

    return { available: conflicts.length === 0, conflicts };
  },
});

export const checkFacilityAvailability = query({
  args: {
    facilityId: v.id("facilities"),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) return { available: false, conflicts: [], currentCount: 0, capacity: 0 };

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_facilityId", (q) => q.eq("facilityId", args.facilityId))
      .collect();

    const activeStatuses = ["pending", "confirmed", "in_progress"];
    const overlapping = bookings.filter(
      (b) =>
        activeStatuses.includes(b.status) &&
        b.startTime < args.endTime &&
        b.endTime > args.startTime
    );

    return {
      available: overlapping.length < facility.capacity,
      conflicts: overlapping,
      currentCount: overlapping.length,
      capacity: facility.capacity,
    };
  },
});

export const bookItem = mutation({
  args: {
    userId: v.id("users"),
    itemId: v.id("items"),
    startTime: v.number(),
    endTime: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    const activeStatuses = ["pending", "confirmed", "in_progress"];
    const conflict = bookings.find(
      (b) =>
        activeStatuses.includes(b.status) &&
        b.startTime < args.endTime &&
        b.endTime > args.startTime
    );

    if (conflict) {
      throw new Error("This item is already booked for that time slot");
    }

    const bookingId = await ctx.db.insert("bookings", {
      userId: args.userId,
      itemId: args.itemId,
      startTime: args.startTime,
      endTime: args.endTime,
      status: "confirmed",
      notes: args.notes,
      createdAt: Date.now(),
    });

    return bookingId;
  },
});

export const bookFacility = mutation({
  args: {
    userId: v.id("users"),
    facilityId: v.id("facilities"),
    startTime: v.number(),
    endTime: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) throw new Error("Facility not found");

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_facilityId", (q) => q.eq("facilityId", args.facilityId))
      .collect();

    const activeStatuses = ["pending", "confirmed", "in_progress"];
    const overlapping = bookings.filter(
      (b) =>
        activeStatuses.includes(b.status) &&
        b.startTime < args.endTime &&
        b.endTime > args.startTime
    );

    if (overlapping.length >= facility.capacity) {
      throw new Error("Facility is fully booked for that time slot");
    }

    const bookingId = await ctx.db.insert("bookings", {
      userId: args.userId,
      facilityId: args.facilityId,
      startTime: args.startTime,
      endTime: args.endTime,
      status: "confirmed",
      notes: args.notes,
      createdAt: Date.now(),
    });

    return bookingId;
  },
});

export const updateStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("no_show"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    await ctx.db.patch(args.bookingId, { status: args.status });

    if (booking && (args.status === "no_show" || args.status === "cancelled")) {
      let resourceName = "your booking";
      if (booking.itemId) {
        const item = await ctx.db.get(booking.itemId);
        resourceName = item?.name ?? "Unknown Item";
      } else if (booking.facilityId) {
        const facility = await ctx.db.get(booking.facilityId);
        resourceName = facility?.name ?? "Unknown Facility";
      }

      const title = args.status === "no_show" ? "No-Show Recorded" : "Booking Cancelled";
      const body = args.status === "no_show"
        ? `You were marked as a no-show for "${resourceName}". Please check in on time for future bookings.`
        : `Your booking for "${resourceName}" has been cancelled by an administrator.`;

      await ctx.db.insert("notifications", {
        userId: booking.userId,
        title,
        body,
        type: "general",
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const cancelBooking = mutation({
  args: { bookingId: v.id("bookings"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.userId !== args.userId) {
      throw new Error("You can only cancel your own bookings");
    }
    if (booking.status === "completed" || booking.status === "no_show") {
      throw new Error("Cannot cancel a completed or no-show booking");
    }
    await ctx.db.patch(args.bookingId, { status: "cancelled" });
  },
});

export const getUserBookings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const results = [];
    for (const booking of bookings) {
      let itemName = null;
      let facilityName = null;

      if (booking.itemId) {
        const item = await ctx.db.get(booking.itemId);
        itemName = item?.name ?? "Unknown Item";
      }
      if (booking.facilityId) {
        const facility = await ctx.db.get(booking.facilityId);
        facilityName = facility?.name ?? "Unknown Facility";
      }

      results.push({ ...booking, itemName, facilityName });
    }

    return results;
  },
});

export const getAllBookings = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const bookings = await ctx.db
      .query("bookings")
      .order("desc")
      .take(limit);

    const results = [];
    for (const booking of bookings) {
      const user = await ctx.db.get(booking.userId);
      let itemName = null;
      let facilityName = null;

      if (booking.itemId) {
        const item = await ctx.db.get(booking.itemId);
        itemName = item?.name ?? "Unknown Item";
      }
      if (booking.facilityId) {
        const facility = await ctx.db.get(booking.facilityId);
        facilityName = facility?.name ?? "Unknown Facility";
      }

      results.push({
        ...booking,
        userName: user?.name ?? "Unknown",
        itemName,
        facilityName,
      });
    }

    return results;
  },
});

export const getUpcomingBookings = query({
  handler: async (ctx) => {
    const now = Date.now();
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_startTime")
      .order("asc")
      .collect();

    const upcoming = bookings.filter(
      (b) =>
        b.endTime > now &&
        (b.status === "confirmed" || b.status === "in_progress")
    );

    const results = [];
    for (const booking of upcoming) {
      const user = await ctx.db.get(booking.userId);
      let itemName = null;
      let facilityName = null;

      if (booking.itemId) {
        const item = await ctx.db.get(booking.itemId);
        itemName = item?.name ?? "Unknown";
      }
      if (booking.facilityId) {
        const facility = await ctx.db.get(booking.facilityId);
        facilityName = facility?.name ?? "Unknown";
      }

      results.push({
        ...booking,
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
        itemName,
        facilityName,
      });
    }

    return results;
  },
});

export const getNoShowStats = query({
  handler: async (ctx) => {
    const noShows = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "no_show"))
      .collect();

    const userCounts: Record<string, { name: string; count: number }> = {};

    for (const booking of noShows) {
      const userId = booking.userId;
      if (!userCounts[userId]) {
        const user = await ctx.db.get(userId);
        userCounts[userId] = { name: user?.name ?? "Unknown", count: 0 };
      }
      userCounts[userId].count++;
    }

    const frequentNoShows = Object.entries(userCounts)
      .filter(([_, v]) => v.count >= 3)
      .map(([id, v]) => ({ userId: id, ...v }));

    return {
      totalNoShows: noShows.length,
      frequentNoShows,
    };
  },
});

export const markOverdueAsNoShow = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const fifteenMin = 15 * 60 * 1000;

    const confirmed = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "confirmed"))
      .collect();

    let marked = 0;
    for (const booking of confirmed) {
      if (now > booking.startTime + fifteenMin && now > booking.endTime) {
        await ctx.db.patch(booking._id, { status: "no_show" });

        let resourceName = "your booking";
        if (booking.itemId) {
          const item = await ctx.db.get(booking.itemId);
          resourceName = item?.name ?? "Unknown Item";
        } else if (booking.facilityId) {
          const facility = await ctx.db.get(booking.facilityId);
          resourceName = facility?.name ?? "Unknown Facility";
        }

        await ctx.db.insert("notifications", {
          userId: booking.userId,
          title: "No-Show Recorded",
          body: `You were marked as a no-show for "${resourceName}". Please check in on time for future bookings.`,
          type: "general",
          isRead: false,
          createdAt: Date.now(),
        });

        marked++;
      }
    }

    return { marked };
  },
});

export const getItemBookings = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .order("desc")
      .collect();

    const activeStatuses = ["pending", "confirmed", "in_progress"];
    const active = bookings.filter((b) => activeStatuses.includes(b.status));

    const results = [];
    for (const booking of active) {
      const user = await ctx.db.get(booking.userId);
      results.push({
        ...booking,
        userName: user?.name ?? "Unknown",
      });
    }

    return results;
  },
});

export const getFacilityBookings = query({
  args: { facilityId: v.id("facilities") },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_facilityId", (q) => q.eq("facilityId", args.facilityId))
      .order("desc")
      .collect();

    const activeStatuses = ["pending", "confirmed", "in_progress"];
    const active = bookings.filter((b) => activeStatuses.includes(b.status));

    const results = [];
    for (const booking of active) {
      const user = await ctx.db.get(booking.userId);
      results.push({
        ...booking,
        userName: user?.name ?? "Unknown",
      });
    }

    return results;
  },
});
