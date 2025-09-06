// ctx = context object
// It gives you access to everything you need inside Convex functions.

// Here we have created all the apis for projects
// This file contains a set of API endpoints for managing projects in a Convex backend application. Convex is a serverless backend platform that simplifies database operations, authentication, and real-time data management. The file defines queries (for fetching data) and mutations (for modifying data) to handle CRUD operations (Create, Read, Update, Delete) for projects associated with a user. The code integrates user authentication, enforces plan-based limits (e.g., free vs. pro plans), and manages project metadata such as images, canvas state, and dimensions.

// Serverless doesn’t mean “no servers” 🚫🖥️. It means you don’t manage the servers yourself.A cloud provider (like AWS, Vercel, Firebase, or Convex) runs and scales the backend code for you.

// A serverless backend like Convex is a fully managed backend-as-a-service where you focus only on your app logic, while Convex handles the database, scaling, real-time updates, and infra automatically.

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Get all projects for the current user
export const getUserProjects = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // Get user's projects, ordered by most recently updated
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_updated", (q) => q.eq("userId", user._id)) //whichever project has been updated first comes at top as order is desc by index: by_user_updated
      .order("desc")
      .collect();

    return projects;
  },
});

// Create a new project
export const create = mutation({
  args: {
    title: v.string(),
    originalImageUrl: v.optional(v.string()),
    currentImageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    width: v.number(),
    height: v.number(),
    canvasState: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // Check plan limits for free users
    if (user.plan === "free") {
      const projectCount = await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      if (projectCount.length >= 5) {
        throw new Error(
          "Free plan limited to 5 projects. Upgrade to Pro for unlimited projects."
        );
      }
    }

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      userId: user._id,
      originalImageUrl: args.originalImageUrl,
      currentImageUrl: args.currentImageUrl,
      thumbnailUrl: args.thumbnailUrl,
      width: args.width,
      height: args.height,
      canvasState: args.canvasState,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user's project count
    await ctx.db.patch(user._id, {
      projectsUsed: user.projectsUsed + 1,
      lastActiveAt: Date.now(),
    });

    return projectId;
  },
});

// Delete a project
export const deleteProject = mutation({
  // ! we are delteing the project through its id
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!user || project.userId !== user._id) {
      throw new Error("Access denied");
    }

    // Delete the project
    await ctx.db.delete(args.projectId);

    // Update user's project count
    await ctx.db.patch(user._id, {
      projectsUsed: Math.max(0, user.projectsUsed - 1), //taking maxm to display no. of projects left
      lastActiveAt: Date.now(),
    });

    return { success: true };
  },
});

// Get a single project by ID
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    // if user is logged in then we need to fetch our projects
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!user || project.userId !== user._id) {
      //to make sure that this particular project belongs to the current user
      throw new Error("Access denied");
    }

    return project;
  },
});

// ! Update project canvas state and metadata -> this api is responsible for autosaving our canvas state
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    canvasState: v.optional(v.any()),
    width: v.optional(v.number()), // ← Add this
    height: v.optional(v.number()), // ← Add this
    currentImageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    activeTransformations: v.optional(v.string()),
    backgroundRemoved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!user || project.userId !== user._id) {
      throw new Error("Access denied");
    }

    // Update the project
    const updateData = {
      updatedAt: Date.now(),
    };

    // Only update provided fields
    if (args.canvasState !== undefined)
      updateData.canvasState = args.canvasState;
    if (args.width !== undefined) updateData.width = args.width;
    if (args.height !== undefined) updateData.height = args.height;
    if (args.currentImageUrl !== undefined)
      updateData.currentImageUrl = args.currentImageUrl;
    if (args.thumbnailUrl !== undefined)
      updateData.thumbnailUrl = args.thumbnailUrl;
    if (args.activeTransformations !== undefined)
      updateData.activeTransformations = args.activeTransformations;
    if (args.backgroundRemoved !== undefined)
      updateData.backgroundRemoved = args.backgroundRemoved;

    await ctx.db.patch(args.projectId, updateData);

    // Update user's last active time
    await ctx.db.patch(user._id, {
      lastActiveAt: Date.now(),
    });

    return args.projectId;
  },
});
