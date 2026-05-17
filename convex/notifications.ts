import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const sendReturnReminder = mutation({
  args: {
    userId: v.id("users"),
    itemName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: "Return Reminder",
      body: `Please return "${args.itemName}" as soon as possible.`,
      type: "return_reminder",
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const getMyNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
    return notifs;
  },
});

export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return notifs.filter((n) => !n.isRead).length;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const n of notifs) {
      if (!n.isRead) {
        await ctx.db.patch(n._id, { isRead: true });
      }
    }
  },
});
