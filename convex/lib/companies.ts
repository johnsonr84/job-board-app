import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;
type CompanyRole = Doc<"companyMembers">["role"];

export async function requireCompany(companyId: Id<"companies">, ctx: Ctx) {
  const company = await ctx.db.get(companyId);
  if (!company) {
    throw new ConvexError("Company was not found.");
  }
  return company;
}

export async function requireActiveMembership(
  ctx: Ctx,
  companyId: Id<"companies">,
  userId: Id<"users">,
) {
  const membership = await ctx.db
    .query("companyMembers")
    .withIndex("by_companyId_userId", (q) =>
      q.eq("companyId", companyId).eq("userId", userId),
    )
    .unique();

  if (!membership || membership.status !== "active") {
    throw new ConvexError("You do not have access to this company workspace.");
  }

  return membership;
}

export async function requireCompanyRole(
  ctx: Ctx,
  companyId: Id<"companies">,
  userId: Id<"users">,
  allowedRoles: CompanyRole[],
) {
  const membership = await requireActiveMembership(ctx, companyId, userId);
  if (!allowedRoles.includes(membership.role)) {
    throw new ConvexError("Insufficient company role permissions.");
  }
  return membership;
}
