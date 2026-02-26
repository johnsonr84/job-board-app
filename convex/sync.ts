import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const upsertUserFromWebhook = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteUserFromWebhook = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (!existing) {
      return { deleted: false };
    }

    const memberships = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("userId", existing._id))
      .collect();

    await Promise.all(
      memberships.map((membership) =>
        ctx.db.patch(membership._id, {
          status: "removed",
          updatedAt: Date.now(),
        }),
      ),
    );

    await ctx.db.delete(existing._id);
    return { deleted: true };
  },
});

export const upsertOrganizationFromWebhook = internalMutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        slug: args.slug,
        logoUrl: args.logoUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("companies", {
      clerkOrgId: args.clerkOrgId,
      name: args.name,
      slug: args.slug,
      logoUrl: args.logoUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteOrganizationFromWebhook = internalMutation({
  args: {
    clerkOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();

    if (!existing) {
      return { deleted: false };
    }

    const memberships = await ctx.db
      .query("companyMembers")
      .withIndex("by_companyId", (q) => q.eq("companyId", existing._id))
      .collect();
    const jobs = await ctx.db
      .query("jobListings")
      .withIndex("by_companyId", (q) => q.eq("companyId", existing._id))
      .collect();

    const now = Date.now();
    await Promise.all(
      memberships.map((membership) =>
        ctx.db.patch(membership._id, {
          status: "removed",
          updatedAt: now,
        }),
      ),
    );
    await Promise.all(
      jobs.map((job) =>
        ctx.db.patch(job._id, {
          isActive: false,
          closedAt: now,
          updatedAt: now,
        }),
      ),
    );

    await ctx.db.delete(existing._id);
    return { deleted: true };
  },
});

export const upsertOrganizationMembershipFromWebhook = internalMutation({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    role: v.union(v.literal("admin"), v.literal("recruiter"), v.literal("member")),
    status: v.union(
      v.literal("active"),
      v.literal("invited"),
      v.literal("suspended"),
      v.literal("removed"),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
    if (!user) {
      throw new ConvexError(`User ${args.clerkUserId} is missing. Sync user first.`);
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();
    if (!company) {
      throw new ConvexError(
        `Company for org ${args.clerkOrgId} is missing. Sync organization first.`,
      );
    }

    const existing = await ctx.db
      .query("companyMembers")
      .withIndex("by_companyId_userId", (q) =>
        q.eq("companyId", company._id).eq("userId", user._id),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        status: args.status,
        joinedAt: args.status === "active" ? (existing.joinedAt ?? now) : existing.joinedAt,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("companyMembers", {
      companyId: company._id,
      userId: user._id,
      clerkOrgId: args.clerkOrgId,
      clerkUserId: args.clerkUserId,
      role: args.role,
      status: args.status,
      joinedAt: args.status === "active" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteOrganizationMembershipFromWebhook = internalMutation({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_clerkOrgId_clerkUserId", (q) =>
        q.eq("clerkOrgId", args.clerkOrgId).eq("clerkUserId", args.clerkUserId),
      )
      .unique();

    if (!membership) {
      return { deleted: false };
    }

    await ctx.db.patch(membership._id, {
      status: "removed",
      updatedAt: Date.now(),
    });

    return { deleted: true };
  },
});
