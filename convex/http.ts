import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";

type CompanyRole = "admin" | "recruiter" | "member";
type MembershipStatus = "active" | "invited" | "suspended" | "removed";

const http = httpRouter();

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function firstEmail(data: Record<string, unknown>): string | undefined {
  const emails = data.email_addresses;
  if (!Array.isArray(emails) || emails.length === 0) return undefined;
  return asString(asRecord(emails[0]).email_address);
}

function normalizeRole(role: string | undefined): CompanyRole {
  if (!role) return "member";
  if (role.includes("admin")) return "admin";
  if (role.includes("recruiter")) return "recruiter";
  return "member";
}

function normalizeMembershipStatus(status: string | undefined): MembershipStatus {
  if (!status) return "active";
  if (status.includes("invite") || status.includes("pending")) return "invited";
  if (status.includes("suspend")) return "suspended";
  if (status.includes("remove") || status.includes("revoke")) return "removed";
  return "active";
}

function getOrgPayload(data: Record<string, unknown>) {
  const organization = asRecord(data.organization);
  return {
    clerkOrgId: asString(data.organization_id) ?? asString(organization.id),
    name: asString(data.name) ?? asString(organization.name),
    slug: asString(data.slug) ?? asString(organization.slug),
    logoUrl: asString(data.image_url) ?? asString(organization.image_url),
  };
}

function getMembershipPayload(data: Record<string, unknown>) {
  const organization = asRecord(data.organization);
  const publicUser = asRecord(data.public_user_data);
  return {
    clerkOrgId: asString(data.organization_id) ?? asString(organization.id),
    clerkUserId:
      asString(data.public_user_id) ??
      asString(data.user_id) ??
      asString(publicUser.user_id),
    role: normalizeRole(asString(data.role)),
    status: normalizeMembershipStatus(asString(data.status)),
    orgName: asString(organization.name),
    orgSlug: asString(organization.slug),
    orgLogoUrl: asString(organization.image_url),
    userEmail: asString(publicUser.identifier),
    userFirstName: asString(publicUser.first_name),
    userLastName: asString(publicUser.last_name),
    userImageUrl: asString(publicUser.image_url),
  };
}

http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!signingSecret) {
      return new Response("Missing CLERK_WEBHOOK_SIGNING_SECRET", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    const payload = await request.text();
    let event: { type: string; data: unknown };
    try {
      const webhook = new Webhook(signingSecret);
      event = webhook.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as { type: string; data: unknown };
    } catch {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    const data = asRecord(event.data);
    try {
      switch (event.type) {
        case "user.created":
        case "user.updated": {
          const clerkUserId = asString(data.id);
          if (!clerkUserId) break;
          await ctx.runMutation(internal.sync.upsertUserFromWebhook, {
            clerkUserId,
            email: firstEmail(data),
            firstName: asString(data.first_name),
            lastName: asString(data.last_name),
            imageUrl: asString(data.image_url),
          });
          break;
        }
        case "user.deleted": {
          const clerkUserId = asString(data.id);
          if (!clerkUserId) break;
          await ctx.runMutation(internal.sync.deleteUserFromWebhook, { clerkUserId });
          break;
        }
        case "organization.created":
        case "organization.updated": {
          const organization = getOrgPayload(data);
          if (!organization.clerkOrgId || !organization.name) break;
          await ctx.runMutation(internal.sync.upsertOrganizationFromWebhook, {
            clerkOrgId: organization.clerkOrgId,
            name: organization.name,
            slug: organization.slug,
            logoUrl: organization.logoUrl,
          });
          break;
        }
        case "organization.deleted": {
          const organization = getOrgPayload(data);
          if (!organization.clerkOrgId) break;
          await ctx.runMutation(internal.sync.deleteOrganizationFromWebhook, {
            clerkOrgId: organization.clerkOrgId,
          });
          break;
        }
        case "organizationMembership.created":
        case "organizationMembership.updated": {
          const membership = getMembershipPayload(data);
          if (!membership.clerkOrgId || !membership.clerkUserId) break;

          await ctx.runMutation(internal.sync.upsertUserFromWebhook, {
            clerkUserId: membership.clerkUserId,
            email: membership.userEmail,
            firstName: membership.userFirstName,
            lastName: membership.userLastName,
            imageUrl: membership.userImageUrl,
          });

          await ctx.runMutation(internal.sync.upsertOrganizationFromWebhook, {
            clerkOrgId: membership.clerkOrgId,
            name: membership.orgName ?? "Organization",
            slug: membership.orgSlug,
            logoUrl: membership.orgLogoUrl,
          });

          await ctx.runMutation(internal.sync.upsertOrganizationMembershipFromWebhook, {
            clerkOrgId: membership.clerkOrgId,
            clerkUserId: membership.clerkUserId,
            role: membership.role,
            status: membership.status,
          });
          break;
        }
        case "organizationMembership.deleted": {
          const membership = getMembershipPayload(data);
          if (!membership.clerkOrgId || !membership.clerkUserId) break;
          await ctx.runMutation(internal.sync.deleteOrganizationMembershipFromWebhook, {
            clerkOrgId: membership.clerkOrgId,
            clerkUserId: membership.clerkUserId,
          });
          break;
        }
        default:
          break;
      }
    } catch {
      return new Response("Webhook processing failed", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  }),
});

export default http;
