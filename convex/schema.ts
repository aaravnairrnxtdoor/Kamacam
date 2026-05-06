import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    token: v.string(), // Anonymous session token
    lastSeen: v.number(),
    status: v.union(v.literal("idle"), v.literal("waiting"), v.literal("chatting")),
    gender: v.string(), // "male", "female", "random"
    preference: v.string(), // "male", "female", "everyone"
  }).index("by_status", ["status"]),

  rooms: defineTable({
    userA: v.id("users"),
    userB: v.id("users"),
    status: v.union(v.literal("active"), v.literal("disconnected")),
  }).index("by_userA", ["userA"])
    .index("by_userB", ["userB"]),

  signals: defineTable({
    roomId: v.id("rooms"),
    senderId: v.id("users"),
    type: v.union(v.literal("offer"), v.literal("answer"), v.literal("candidate"), v.literal("message")),
    data: v.string(), // JSON serialized SDP/ICE or message content
    timestamp: v.number(),
  }).index("by_room", ["roomId"]),
});
