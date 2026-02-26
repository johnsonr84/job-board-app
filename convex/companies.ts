import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewerUser } from "./lib/auth";
import { requireActiveMembership } from "./lib/companies";

export const getMyCompanyContext = query({
  args: {
    clerkOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getViewerUser(ctx);
    if (!user) {
      return null;
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();
    if (!company) {
      return null;
    }

    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_companyId_userId", (q) =>
        q.eq("companyId", company._id).eq("userId", user._id),
      )
      .unique();
    if (!membership || membership.status !== "active") {
      return null;
    }

    const jobLimit =
      company.jobLimit ??
      (company.plan === "growth"
        ? 25
        : company.plan === "starter"
          ? 5
          : 1);
    const seatLimit =
      company.seatLimit ??
      (company.plan === "growth"
        ? 10
        : company.plan === "starter"
          ? 3
          : 1);

    return {
      companyId: company._id,
      companyName: company.name,
      companySlug: company.slug,
      role: membership.role,
      clerkOrgId: company.clerkOrgId,
      jobLimit,
      seatLimit,
    };
  },
});

export const getCompanyUsage = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewerUser(ctx);
    if (!viewer) {
      return null;
    }

    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_companyId_userId", (q) =>
        q.eq("companyId", args.companyId).eq("userId", viewer._id),
      )
      .unique();
    if (!membership || membership.status !== "active") {
      return null;
    }

    const [members, activeJobs, allJobs] = await Promise.all([
      ctx.db
        .query("companyMembers")
        .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
        .collect(),
      ctx.db
        .query("jobListings")
        .withIndex("by_companyId_isActive", (q) =>
          q.eq("companyId", args.companyId).eq("isActive", true),
        )
        .collect(),
      ctx.db
        .query("jobListings")
        .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
        .collect(),
    ]);

    return {
      activeMemberCount: members.filter((member) => member.status === "active").length,
      invitedMemberCount: members.filter((member) => member.status === "invited").length,
      activeJobCount: activeJobs.length,
      totalJobCount: allJobs.length,
    };
  },
});

const planValidator = v.union(
  v.literal("free"),
  v.literal("starter"),
  v.literal("growth"),
);

export const syncCompanyPlan = mutation({
  args: {
    clerkOrgId: v.string(),
    plan: planValidator,
    seatLimit: v.number(),
    jobLimit: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getViewerUser(ctx);
    if (!user) {
      throw new ConvexError("You must be signed in to sync plan.");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();
    if (!company) {
      throw new ConvexError("Company not found for this organization.");
    }

    await requireActiveMembership(ctx, company._id, user._id);

    const now = Date.now();
    await ctx.db.patch(company._id, {
      plan: args.plan,
      seatLimit: args.seatLimit,
      jobLimit: args.jobLimit,
      updatedAt: now,
    });

    return null;
  },
});
