import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrUpdateUser = mutation({
  args: {
    token: v.string(),
    gender: v.string(),
    preference: v.string(),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "idle"))
      .collect();
    
    const userByToken = existing.find(u => u.token === args.token);

    if (userByToken) {
      await ctx.db.patch(userByToken._id, {
        lastSeen: Date.now(),
        gender: args.gender,
        preference: args.preference,
      });
      return userByToken._id;
    }

    return await ctx.db.insert("users", {
      token: args.token,
      lastSeen: Date.now(),
      status: "idle",
      gender: args.gender,
      preference: args.preference,
    });
  },
});

export const findMatch = mutation({
  args: { userId: v.id("users") },
  returns: v.union(v.id("rooms"), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Set status to waiting
    await ctx.db.patch(args.userId, { status: "waiting" });

    // Matching logic:
    // 1. Find users who are 'waiting'
    // 2. Who match our preference
    // 3. And we match THEIR preference
    const waitingUsers = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();

    const match = waitingUsers.find((other) => {
        if (other._id === args.userId) return false;

        // Does the other user match our preference?
        const weLikeThem = user.preference === "everyone" || user.preference === other.gender;
        
        // Do we match the other user's preference?
        const theyLikeUs = other.preference === "everyone" || other.preference === user.gender;

        return weLikeThem && theyLikeUs;
    });

    if (match) {
      const roomId = await ctx.db.insert("rooms", {
        userA: args.userId,
        userB: match._id,
        status: "active",
      });

      await ctx.db.patch(args.userId, { status: "chatting" });
      await ctx.db.patch(match._id, { status: "chatting" });

      return roomId;
    }

    return null;
  },
});

export const getRoom = query({
  args: { userId: v.id("users") },
  returns: v.union(v.object({
    _id: v.id("rooms"),
    _creationTime: v.number(),
    userA: v.id("users"),
    userB: v.id("users"),
    status: v.string(),
  }), v.null()),
  handler: async (ctx, args) => {
    const roomA = await ctx.db
      .query("rooms")
      .withIndex("by_userA", (q) => q.eq("userA", args.userId))
      .unique();
    
    if (roomA && roomA.status === "active") return roomA;

    const roomB = await ctx.db
      .query("rooms")
      .withIndex("by_userB", (q) => q.eq("userB", args.userId))
      .unique();

    if (roomB && roomB.status === "active") return roomB;

    return null;
  },
});

export const sendSignal = mutation({
  args: {
    roomId: v.id("rooms"),
    senderId: v.id("users"),
    type: v.union(v.literal("offer"), v.literal("answer"), v.literal("candidate"), v.literal("message")),
    data: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("signals", {
      roomId: args.roomId,
      senderId: args.senderId,
      type: args.type,
      data: args.data,
      timestamp: Date.now(),
    });
    return null;
  },
});

export const getSignals = query({
  args: { roomId: v.id("rooms"), userId: v.id("users") },
  returns: v.array(v.object({
    _id: v.id("signals"),
    type: v.string(),
    data: v.string(),
    senderId: v.id("users"),
    timestamp: v.number(),
  })),
  handler: async (ctx, args) => {
    const signals = await ctx.db
      .query("signals")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return signals.filter(s => s.senderId !== args.userId || s.type === "message");
  },
});

export const leaveRoom = mutation({
    args: { userId: v.id("users"), roomId: v.id("rooms") },
    returns: v.null(),
    handler: async (ctx, args) => {
        await ctx.db.patch(args.roomId, { status: "disconnected" });
        await ctx.db.patch(args.userId, { status: "idle" });
        return null;
    }
})
