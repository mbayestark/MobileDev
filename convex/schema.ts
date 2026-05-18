import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    studentId: v.string(),
    password: v.optional(v.string()),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("student"),
      v.literal("faculty"),
      v.literal("staff")
    ),
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
    isAdmin: v.optional(v.boolean()),
    adminLevel: v.optional(
      v.union(v.literal("super"), v.literal("standard"))
    ),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    pushToken: v.optional(v.string()),
  }).index("by_studentId", ["studentId"]),

  items: defineTable({
    barcode: v.string(),
    name: v.string(),
    category: v.union(
      v.literal("tool"),
      v.literal("equipment"),
      v.literal("consumable")
    ),
    location: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("in_use"),
      v.literal("missing"),
      v.literal("damaged")
    ),
    createdAt: v.number(),
    notes: v.optional(v.string()),
  }).index("by_barcode", ["barcode"]),

  facilities: defineTable({
    barcode: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("classroom"),
      v.literal("lab"),
      v.literal("cafeteria")
    ),
    capacity: v.number(),
    createdAt: v.number(),
    notes: v.optional(v.string()),
  }).index("by_barcode", ["barcode"]),

  scans: defineTable({
    userId: v.id("users"),
    itemId: v.optional(v.id("items")),
    facilityId: v.optional(v.id("facilities")),
    action: v.union(
      v.literal("checkout"),
      v.literal("return"),
      v.literal("entry"),
      v.literal("exit")
    ),
    timestamp: v.number(),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  activeCheckouts: defineTable({
    itemId: v.id("items"),
    userId: v.id("users"),
    checkoutTime: v.number(),
    expectedReturnTime: v.optional(v.number()),
  })
    .index("by_itemId", ["itemId"])
    .index("by_userId", ["userId"]),

  activeOccupancy: defineTable({
    facilityId: v.id("facilities"),
    userId: v.id("users"),
    entryTime: v.number(),
  })
    .index("by_facilityId", ["facilityId"])
    .index("by_userId", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    type: v.union(
      v.literal("return_reminder"),
      v.literal("general")
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  bookings: defineTable({
    userId: v.id("users"),
    itemId: v.optional(v.id("items")),
    facilityId: v.optional(v.id("facilities")),
    startTime: v.number(),
    endTime: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("no_show"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_itemId", ["itemId"])
    .index("by_facilityId", ["facilityId"])
    .index("by_status", ["status"])
    .index("by_startTime", ["startTime"]),
});
