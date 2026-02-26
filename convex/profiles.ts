import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateViewerUser, getViewerUser } from "./lib/auth";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getViewerUser(ctx);
    if (!user) {
      return null;
    }

    const [profile, resumes, experiences, education, certifications] =
      await Promise.all([
        ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique(),
        ctx.db
          .query("resumes")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .order("desc")
          .collect(),
        ctx.db
          .query("experiences")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect(),
        ctx.db
          .query("education")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect(),
        ctx.db
          .query("certifications")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect(),
      ]);

    const sortedExperiences = experiences.sort((a, b) => a.order - b.order);
    const sortedEducation = education.sort((a, b) => a.order - b.order);

    const resumesWithUrls = await Promise.all(
      resumes.map(async (r) => ({
        ...r,
        fileUrl: r.storageId
          ? await ctx.storage.getUrl(r.storageId)
          : (r.fileUrl ?? null),
      })),
    );

    return {
      user,
      profile,
      resumes: resumesWithUrls,
      experiences: sortedExperiences,
      education: sortedEducation,
      certifications,
    };
  },
});

export const getPublicProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const [profile, resumes, experiences, education, certifications] =
      await Promise.all([
        ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .unique(),
        ctx.db
          .query("resumes")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .order("desc")
          .collect(),
        ctx.db
          .query("experiences")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .collect(),
        ctx.db
          .query("education")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .collect(),
        ctx.db
          .query("certifications")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .collect(),
      ]);

    const sortedExperiences = experiences.sort((a, b) => a.order - b.order);
    const sortedEducation = education.sort((a, b) => a.order - b.order);

    const resumesWithUrls = await Promise.all(
      resumes.map(async (r) => ({
        ...r,
        fileUrl: r.storageId
          ? await ctx.storage.getUrl(r.storageId)
          : (r.fileUrl ?? null),
      })),
    );

    return {
      user,
      profile,
      resumes: resumesWithUrls,
      experiences: sortedExperiences,
      education: sortedEducation,
      certifications,
    };
  },
});

export const upsertMyProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    summary: v.optional(v.string()),
    location: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    yearsExperience: v.optional(v.number()),
    skills: v.optional(v.array(v.string())),
    openToWork: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const now = Date.now();
    const normalizedSkills = (args.skills ?? [])
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!existing) {
      const profileId = await ctx.db.insert("profiles", {
        userId: user._id,
        firstName: args.firstName,
        lastName: args.lastName,
        headline: args.headline,
        bio: args.bio,
        summary: args.summary,
        location: args.location,
        phone: args.phone,
        website: args.website,
        linkedinUrl: args.linkedinUrl,
        githubUrl: args.githubUrl,
        yearsExperience: args.yearsExperience,
        skills: normalizedSkills,
        openToWork: args.openToWork ?? true,
        updatedAt: now,
      });
      return await ctx.db.get(profileId);
    }

    await ctx.db.patch(existing._id, {
      firstName: args.firstName ?? undefined,
      lastName: args.lastName ?? undefined,
      headline: args.headline ?? undefined,
      bio: args.bio ?? undefined,
      summary: args.summary ?? undefined,
      location: args.location ?? undefined,
      phone: args.phone ?? undefined,
      website: args.website ?? undefined,
      linkedinUrl: args.linkedinUrl ?? undefined,
      githubUrl: args.githubUrl ?? undefined,
      yearsExperience: args.yearsExperience ?? undefined,
      skills: normalizedSkills.length > 0 ? normalizedSkills : existing.skills,
      openToWork: args.openToWork ?? undefined,
      updatedAt: now,
    });

    return await ctx.db.get(existing._id);
  },
});

// --- Experience CRUD ---

export const addExperience = mutation({
  args: {
    title: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    isCurrent: v.boolean(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("experiences")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const id = await ctx.db.insert("experiences", {
      userId: user._id,
      title: args.title,
      company: args.company,
      location: args.location,
      startDate: args.startDate,
      endDate: args.endDate,
      isCurrent: args.isCurrent,
      description: args.description,
      order: existing.length,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const updateExperience = mutation({
  args: {
    experienceId: v.id("experiences"),
    title: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    isCurrent: v.boolean(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const existing = await ctx.db.get(args.experienceId);
    if (!existing || existing.userId !== user._id) {
      throw new ConvexError("Experience not found.");
    }
    await ctx.db.patch(args.experienceId, {
      title: args.title,
      company: args.company,
      location: args.location,
      startDate: args.startDate,
      endDate: args.endDate,
      isCurrent: args.isCurrent,
      description: args.description,
      updatedAt: Date.now(),
    });
  },
});

export const deleteExperience = mutation({
  args: { experienceId: v.id("experiences") },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const existing = await ctx.db.get(args.experienceId);
    if (!existing || existing.userId !== user._id) {
      throw new ConvexError("Experience not found.");
    }
    await ctx.db.delete(args.experienceId);
  },
});

// --- Education CRUD ---

export const addEducation = mutation({
  args: {
    school: v.string(),
    degree: v.optional(v.string()),
    fieldOfStudy: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("education")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const id = await ctx.db.insert("education", {
      userId: user._id,
      school: args.school,
      degree: args.degree,
      fieldOfStudy: args.fieldOfStudy,
      startDate: args.startDate,
      endDate: args.endDate,
      description: args.description,
      order: existing.length,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const updateEducation = mutation({
  args: {
    educationId: v.id("education"),
    school: v.string(),
    degree: v.optional(v.string()),
    fieldOfStudy: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const existing = await ctx.db.get(args.educationId);
    if (!existing || existing.userId !== user._id) {
      throw new ConvexError("Education not found.");
    }
    await ctx.db.patch(args.educationId, {
      school: args.school,
      degree: args.degree,
      fieldOfStudy: args.fieldOfStudy,
      startDate: args.startDate,
      endDate: args.endDate,
      description: args.description,
      updatedAt: Date.now(),
    });
  },
});

export const deleteEducation = mutation({
  args: { educationId: v.id("education") },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const existing = await ctx.db.get(args.educationId);
    if (!existing || existing.userId !== user._id) {
      throw new ConvexError("Education not found.");
    }
    await ctx.db.delete(args.educationId);
  },
});

// --- Certifications CRUD ---

export const addCertification = mutation({
  args: {
    name: v.string(),
    issuingOrg: v.string(),
    issueDate: v.optional(v.string()),
    expirationDate: v.optional(v.string()),
    credentialUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const now = Date.now();
    const id = await ctx.db.insert("certifications", {
      userId: user._id,
      name: args.name,
      issuingOrg: args.issuingOrg,
      issueDate: args.issueDate,
      expirationDate: args.expirationDate,
      credentialUrl: args.credentialUrl,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const updateCertification = mutation({
  args: {
    certificationId: v.id("certifications"),
    name: v.string(),
    issuingOrg: v.string(),
    issueDate: v.optional(v.string()),
    expirationDate: v.optional(v.string()),
    credentialUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const existing = await ctx.db.get(args.certificationId);
    if (!existing || existing.userId !== user._id) {
      throw new ConvexError("Certification not found.");
    }
    await ctx.db.patch(args.certificationId, {
      name: args.name,
      issuingOrg: args.issuingOrg,
      issueDate: args.issueDate,
      expirationDate: args.expirationDate,
      credentialUrl: args.credentialUrl,
      updatedAt: Date.now(),
    });
  },
});

export const deleteCertification = mutation({
  args: { certificationId: v.id("certifications") },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const existing = await ctx.db.get(args.certificationId);
    if (!existing || existing.userId !== user._id) {
      throw new ConvexError("Certification not found.");
    }
    await ctx.db.delete(args.certificationId);
  },
});

// --- Resume & Resources ---

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES_PER_USER = 10;

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getOrCreateViewerUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveResume = mutation({
  args: {
    title: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);

    if (args.fileSize > MAX_FILE_SIZE) {
      throw new ConvexError("File exceeds the 10 MB limit.");
    }

    const existing = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (existing.length >= MAX_FILES_PER_USER) {
      throw new ConvexError(
        `You can upload a maximum of ${MAX_FILES_PER_USER} files.`,
      );
    }

    const now = Date.now();
    const isFirst = existing.length === 0;

    const resumeId = await ctx.db.insert("resumes", {
      userId: user._id,
      title: args.title,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      contentType: args.contentType,
      isDefault: isFirst,
      createdAt: now,
      updatedAt: now,
    });
    return resumeId;
  },
});

export const deleteResume = mutation({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const user = await getOrCreateViewerUser(ctx);
    const existing = await ctx.db.get(args.resumeId);
    if (!existing || existing.userId !== user._id) {
      throw new ConvexError("File not found.");
    }

    if (existing.storageId) {
      await ctx.storage.delete(existing.storageId);
    }
    await ctx.db.delete(args.resumeId);

    if (existing.isDefault) {
      const replacement = await ctx.db
        .query("resumes")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .order("desc")
        .first();

      if (replacement) {
        await ctx.db.patch(replacement._id, {
          isDefault: true,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },

});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
