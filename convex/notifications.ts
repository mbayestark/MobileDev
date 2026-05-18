import { query, mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const sendReturnReminder = action({
  args: {
    userId: v.id("users"),
    itemName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.notifications.createReminder, {
      userId: args.userId,
      itemName: args.itemName,
    });

    const user = await ctx.runQuery(internal.notifications.getUserPushToken, {
      userId: args.userId,
    });

    if (user?.pushToken) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: user.pushToken,
          title: "Return Reminder",
          body: `Please return "${args.itemName}" as soon as possible.`,
          sound: "default",
        }),
      });
    }
  },
});

export const createReminder = internalMutation({
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

export const getUserPushToken = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user ? { pushToken: user.pushToken } : null;
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
