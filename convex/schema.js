// import { defineSchema, defineTable } from "convex/server";
// import { v } from "convex/values";

// export default defineSchema({
//   users: defineTable({
//     name: v.string(),
//     email:v.string(),
//     tokenIdentifier: v.string(),
//     imageUrl:v.optional(v.string()),
//   }).index("by_token", ["tokenIdentifier"]),
// });

// convex/schema.js


// index in our database helps us to query things faster
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced with Clerk authentication
  users: defineTable({
    // Basic user info from Clerk
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(), // Clerk user ID for auth
    imageUrl: v.optional(v.string()), // Profile picture

    // Subscription plan (managed by Clerk billing)
    plan: v.union(v.literal("free"), v.literal("pro")),

    // Usage tracking for plan limits
    projectsUsed: v.number(), // Current project count
    exportsThisMonth: v.number(), // Monthly export limit tracking

    // Activity timestamps
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"]) // Primary auth lookup
    .index("by_email", ["email"]) // Email lookups
    .searchIndex("search_name", { searchField: "name" }) // User search
    .searchIndex("search_email", { searchField: "email" }),

  // Main projects table - stores editing sessions
  projects: defineTable({
    // Basic project info
    title: v.string(),
    userId: v.id("users"), // this is a foreign key which belongs to the user table

    // Canvas dimensions and state
    canvasState: v.any(), // Fabric.js canvas JSON (objects, layers, etc.)
    width: v.number(), // Canvas width in pixels
    height: v.number(), // Canvas height in pixels

    // Image pipeline - tracks image transformations
    originalImageUrl: v.optional(v.string()), // Initial uploaded image
    // optional means they can be empty by default
    currentImageUrl: v.optional(v.string()), // Current processed image ka url
    thumbnailUrl: v.optional(v.string()), // HW - Small preview for dashboard

    // ImageKit transformation state
    activeTransformations: v.optional(v.string()), // Current ImageKit URL params

    // AI features state - tracks what AI processing has been applied
    backgroundRemoved: v.optional(v.boolean()), // Has background been removed

    // Organization
    folderId: v.optional(v.id("folders")), // HW - Optional folder organization
    // /folderId is foregin key from folders table

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(), // Last edit time
  })
    .index("by_user", ["userId"]) // Get user's projects
    .index("by_user_updated", ["userId", "updatedAt"]) // Recent projects
    .index("by_folder", ["folderId"]), // Projects in folder

  // Simple folder organization ,for each organnization, we will have separate folders
  folders: defineTable({
    name: v.string(), // Folder name
    userId: v.id("users"), // Owner
    createdAt: v.number(),
  }).index("by_user", ["userId"]), // User's folders
});

/* 
PLAN LIMITS EXAMPLE:
- Free: 3 projects, 20 exports/month, basic features only
- Pro: Unlimited projects/exports, all AI features
*/
