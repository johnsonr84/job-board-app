# Jobly -- Full Rebuild User Stories

A step-by-step rebuild guide for the Jobly job board application, written as narrative user stories in logical build order. Each story describes a user-facing capability with its requirements, restrictions, feature gates, and notification triggers. Setup and configuration steps are woven into the story where they are first needed.

---

## Story 1: A Visitor Can See the Landing Page

The very first thing a visitor sees is a polished marketing landing page at the root URL. It should feel like a real product -- not a template.

### Requirements

- The page lives at `app/page.tsx` and is a client component (it manages mobile menu open/close state).
- **Header**: displays the `SiteLogo` component (a link to `/` with the app name "Jobly"), navigation links to "Find Jobs", "For Companies", and "Pricing". When a user is signed out, show a `SignInButton`. When signed in, show a `UserButton`.
- **Hero section**: a large heading, subtitle text, and animated floating avatar images (six images sourced from `https://i.pravatar.cc/120?img=X`) positioned absolutely with unique top/left/right offsets and staggered float animation delays. Six small colored decoration dots (jade, amber, rose) float alongside.
- **Job search form**: a row with an employment type dropdown (All types, Full-time, Part-time, Contract, Internship, Temporary), a keyword text input, a location text input, and a search button. Submitting navigates to `/jobs` with the chosen filters as query parameters.
- **Popular tags row**: four clickable tag pills -- "Design", "Art", "Business", "Video Editing".
- **Company logos section**: six mock company names rendered in varied typography styles (different weights, italics, tracking).
- **How it works section**: three steps with icons -- "Create Account", "Complete your profile", "Apply job or hire".
- **Two-path section**: side-by-side cards for candidates (Find Jobs, Build Profile, Track Applications) and companies (Post Jobs, Review Candidates, Manage Team).
- **Stats section**: three large numbers -- "100K+ jobs", "50K+ companies", "1M+ candidates".
- **CTA section**: a call to action encouraging sign-up with a link to sign in.
- **Footer**: copyright text.

### Implementation notes (project bootstrap)

This is the first story, so all project scaffolding happens here:

- Scaffold the project with `pnpm create next-app@latest` choosing TypeScript, Tailwind CSS, App Router, and no `src` directory.
- Install all runtime dependencies: `@clerk/clerk-react`, `@clerk/nextjs`, `@hookform/resolvers`, `@tiptap/extension-placeholder`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `class-variance-authority`, `clsx`, `convex`, `lucide-react`, `next`, `radix-ui`, `react`, `react-dom`, `react-hook-form`, `sonner`, `svix`, `tailwind-merge`, `zod`.
- Install dev dependencies: `@convex-dev/eslint-plugin`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `npm-run-all2`, `prettier`, `shadcn`, `tailwindcss`, `tw-animate-css`, `typescript`.
- Set up shadcn/ui by initializing `components.json` with the `new-york` style, `neutral` base color, Tailwind CSS v4, and aliases pointing `@/components`, `@/lib`, `@/components/ui`.
- Configure two Google fonts in the root layout: **Bricolage Grotesque** (display/headings, variable `--font-bricolage`) and **Figtree** (body text, variable `--font-figtree`).
- Build out `app/globals.css` with the full "Warm Professional" design system. This includes CSS layer ordering (`@layer theme, base, clerk, components, utilities`), all light-mode CSS variables (background `#fafaf8`, foreground `#1a1523`, terracotta `#e54d2e`, jade `#30a46c`, amber-accent `#e5a00d`, plus card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart, and sidebar colors), all dark-mode overrides, four keyframe animations (`fade-in`, `slide-up`, `slide-down`, `float`), eight stagger-delay utility classes (`.stagger-1` through `.stagger-8`), three warm-shadow utilities, TipTap placeholder styles, `.prose-job` rich text display styles, a Clerk PricingTable z-index fix, and a grain texture overlay on `body::before`.
- Configure `next.config.ts` with a remote image pattern allowing `https://i.pravatar.cc`.
- Configure `eslint.config.mjs` to include `@convex-dev/eslint-plugin`.
- Configure `postcss.config.mjs` with the `@tailwindcss/postcss` plugin.
- Create the `SiteLogo` component at `components/site-logo.tsx` -- a simple link to `/` displaying the app name.
- Create `lib/utils.ts` with a `cn()` helper combining `clsx` and `tailwind-merge`.
- Set up the root layout at `app/layout.tsx` with both font variables applied to the `<body>`, metadata (title "Jobly -- Find jobs you actually want"), and the `ClerkProvider` wrapping everything (details in Story 2). Include the `Toaster` from `sonner` for toast notifications.

---

## Story 2: A Visitor Can Sign Up, Sign In, and Sign Out

A new visitor can create an account, sign in, and sign out. Authentication protects candidate and company routes while leaving the landing page, sign-in, sign-up, and pricing pages public.

### Requirements

- **Sign-up page** at `app/sign-up/[[...sign-up]]/page.tsx` renders the Clerk `SignUp` component alongside the `SiteLogo` and a welcome message ("Join Jobly -- it takes less than a minute"). Uses the catch-all route pattern for Clerk's internal routing.
- **Sign-in page** at `app/sign-in/[[...sign-in]]/page.tsx` renders the Clerk `SignIn` component alongside the `SiteLogo` and a welcome message ("Welcome back -- sign in to continue").
- Once signed in, the user sees a `UserButton` in the header of both candidate and company layouts.
- Signing out returns the user to the landing page.

### Route protection rules

- **Public routes** (no auth required): `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/pricing`.
- **Candidate routes** (require sign-in): `/server`, `/jobs(.*)`, `/applications(.*)`, `/favorites(.*)`, `/profile(.*)`.
- **Company routes** (require sign-in + organization): `/company(.*)`. If the user has no `orgId`, redirect to `/pricing?reason=org_required`. If the user has an org but none of the roles `org:admin`, `org:recruiter`, or `org:member`, redirect to `/`.

### Implementation notes

- Create a `.env.local` file with three variables: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from the Clerk dashboard), `CLERK_SECRET_KEY` (from the Clerk dashboard), and `NEXT_PUBLIC_CONVEX_URL` (from the Convex dashboard, added in Story 3).
- In `app/layout.tsx`, wrap the app in `ClerkProvider` with the `dynamic` prop. Customize its `appearance` prop: set `cssLayerName` to `"clerk"`, `colorPrimary` to `var(--terracotta)`, map background/foreground/muted/border/input/ring colors to CSS variables, set `borderRadius` to `var(--radius)`, and set `fontFamily` to the Figtree variable.
- Create the middleware file at `proxy.ts` (Next.js 16 uses `proxy.ts` instead of `middleware.ts`). Use `clerkMiddleware` from `@clerk/nextjs/server` with `createRouteMatcher` to define the three route groups above. The handler calls `auth.protect()` on candidate and company routes. For company routes, it additionally checks for `orgId` and valid roles using `has({ role: "org:admin" })`, `has({ role: "org:recruiter" })`, and `has({ role: "org:member" })`.

### Clerk Dashboard setup

- Create a new Clerk project and copy the publishable key and secret key into `.env.local`.

---

## Story 3: The Backend Database Is Ready

Before building any data-driven features, the Convex backend needs to be initialized with the full database schema and connected to Clerk for authentication.

### Requirements

- The Convex project is initialized and the schema defines all 12 tables the app will use.
- The Convex client is integrated with Clerk so that authenticated users can call Convex functions.

### Schema overview

The schema at `convex/schema.ts` defines:

- **users** -- `clerkUserId`, `email`, `firstName`, `lastName`, `imageUrl`, `createdAt`, `updatedAt`. Indexed by `clerkUserId`.
- **profiles** -- `userId` (references users), `firstName`, `lastName`, `headline`, `bio`, `summary`, `location`, `phone`, `website`, `linkedinUrl`, `githubUrl`, `yearsExperience`, `skills` (string array), `openToWork` (boolean), `updatedAt`. Indexed by `userId`.
- **experiences** -- `userId`, `title`, `company`, `location`, `startDate`, `endDate`, `isCurrent`, `description`, `order`, `createdAt`, `updatedAt`. Indexed by `userId` and by `userId` + `order`.
- **education** -- `userId`, `school`, `degree`, `fieldOfStudy`, `startDate`, `endDate`, `description`, `order`, `createdAt`, `updatedAt`. Indexed by `userId` and by `userId` + `order`.
- **certifications** -- `userId`, `name`, `issuingOrg`, `issueDate`, `expirationDate`, `credentialUrl`, `createdAt`, `updatedAt`. Indexed by `userId`.
- **resumes** -- `userId`, `title`, `storageId` (Convex file storage), `fileUrl`, `fileName`, `fileSize`, `contentType`, `isDefault`, `createdAt`, `updatedAt`. Indexed by `userId` and by `userId` + `isDefault`.
- **companies** -- `clerkOrgId`, `name`, `slug`, `logoUrl`, `website`, `description`, `location`, `createdByUserId`, `plan` (union of `"free"`, `"starter"`, `"growth"`), `seatLimit`, `jobLimit`, `createdAt`, `updatedAt`. Indexed by `clerkOrgId` and by `slug`.
- **companyMembers** -- `companyId`, `userId`, `clerkOrgId`, `clerkUserId`, `role` (union of `"admin"`, `"recruiter"`, `"member"`), `status` (union of `"active"`, `"invited"`, `"suspended"`, `"removed"`), `joinedAt`, `createdAt`, `updatedAt`. Indexed by `companyId`, by `userId`, by `companyId` + `userId`, and by `clerkOrgId` + `clerkUserId`.
- **jobListings** -- `companyId`, `companyName`, `title`, `description`, `location`, `employmentType` (full_time / part_time / contract / internship / temporary), `workplaceType` (on_site / remote / hybrid), `salaryMin`, `salaryMax`, `salaryCurrency`, `tags` (string array), `searchText`, `isActive`, `featured`, `autoCloseOnAccept`, `applicationCount`, `postedByUserId`, `createdAt`, `updatedAt`, `closedAt`. Five indexes plus a full-text search index named `search_jobs` on `searchText` with filter fields `isActive`, `companyId`, `workplaceType`, `employmentType`.
- **applications** -- `jobId`, `companyId`, `applicantUserId`, `status` (submitted / in_review / accepted / rejected / withdrawn), `coverLetter`, `resumeId`, `answers`, `decidedByUserId`, `decidedAt`, `createdAt`, `updatedAt`. Five indexes including by `jobId` + `applicantUserId` (for duplicate detection).
- **favorites** -- `userId`, `jobId`, `createdAt`. Three indexes including by `userId` + `jobId` (for uniqueness checks).
- **notifications** -- `userId`, `type` (application_status / application_received / job_closed / system), `title`, `message`, `linkUrl`, `metadata`, `isRead`, `readAt`, `createdAt`. Indexed by `userId` + `createdAt` and by `userId` + `isRead` + `createdAt`.

### Implementation notes

- Run `pnpm add convex` then `npx convex dev --once` to initialize the Convex project. This creates the `convex/` directory.
- Create `convex/auth.config.ts` exporting a provider config with the `domain` set to `process.env.CLERK_JWT_ISSUER_DOMAIN` and `applicationID` set to `"convex"`.
- Create `components/ConvexClientProvider.tsx` as a client component that wraps children in `ConvexProviderWithClerk`, passing a `ConvexReactClient` instance (constructed from `NEXT_PUBLIC_CONVEX_URL`) and the `useAuth` hook from `@clerk/nextjs`. Render this provider inside the `ClerkProvider` in the root layout.
- Create shared auth helpers at `convex/lib/auth.ts`: `requireIdentity` (throws if not authenticated), `getViewerUser` (looks up user by `identity.subject`), `requireViewerUser` (throws if user record not found), `getOrCreateViewerUser` (creates the user record on-the-fly if the webhook hasn't synced yet).
- Create shared company helpers at `convex/lib/companies.ts`: `requireCompany` (throws if company not found), `requireActiveMembership` (checks membership status is "active"), `requireCompanyRole` (checks role against an allowed-roles array).
- Create `lib/convex-error.ts` with a `getErrorMessage` helper that extracts human-readable messages from `ConvexError`.

### Clerk Dashboard setup

- Go to JWT Templates in the Clerk dashboard. Create a new template named `convex`. Copy the issuer URL.

### Convex Dashboard setup

- In the Convex deployment settings, add an environment variable `CLERK_JWT_ISSUER_DOMAIN` with the issuer URL from the Clerk JWT template.

---

## Story 4: User Data Syncs Automatically via Webhooks

When a user signs up, updates their profile, or is deleted in Clerk, the data automatically syncs to the Convex database. The same applies to organizations and organization memberships.

### Requirements

- A Clerk webhook endpoint at `/webhooks/clerk` (Convex HTTP route) receives events and syncs data.
- **User events**: `user.created` and `user.updated` upsert a record in the `users` table using the Clerk user ID. Fields synced: `clerkUserId`, `email` (from first email address), `firstName`, `lastName`, `imageUrl`. On `user.deleted`, the user record is deleted and all their company memberships are marked as `"removed"`.
- **Organization events**: `organization.created` and `organization.updated` upsert a record in the `companies` table by `clerkOrgId`. Fields synced: `name`, `slug`, `logoUrl`. On `organization.deleted`, the company is deleted, all its memberships are marked `"removed"`, and all its job listings are closed (`isActive` set to false).
- **Membership events**: `organizationMembership.created` and `organizationMembership.updated` first ensure the user and company records exist (upserting them from the event payload if needed), then upsert the membership. The role is normalized: if the role string contains "admin" it becomes `"admin"`, if it contains "recruiter" it becomes `"recruiter"`, otherwise `"member"`. The status is normalized: strings containing "invite" or "pending" become `"invited"`, "suspend" becomes `"suspended"`, "remove" or "revoke" becomes `"removed"`, otherwise `"active"`. On `organizationMembership.deleted`, the membership status is set to `"removed"`.
- All webhook payloads are verified using Svix signature validation against three headers: `svix-id`, `svix-timestamp`, `svix-signature`.

### Files to create

- `convex/http.ts` -- defines the HTTP route and webhook handler with signature verification and event dispatch.
- `convex/sync.ts` -- six internal mutations: `upsertUserFromWebhook`, `deleteUserFromWebhook`, `upsertOrganizationFromWebhook`, `deleteOrganizationFromWebhook`, `upsertOrganizationMembershipFromWebhook`, `deleteOrganizationMembershipFromWebhook`.

### Implementation notes

- Install `svix` with `pnpm add svix`.

### Clerk Dashboard setup

- Go to Webhooks in the Clerk dashboard. Create a new endpoint.
- Set the URL to your Convex site URL followed by `/webhooks/clerk`. You can find the site URL in the Convex dashboard under "Deployment Settings" > "HTTP Actions".
- Subscribe to all nine events: `user.created`, `user.updated`, `user.deleted`, `organization.created`, `organization.updated`, `organization.deleted`, `organizationMembership.created`, `organizationMembership.updated`, `organizationMembership.deleted`.
- Copy the signing secret from the webhook endpoint.

### Convex Dashboard setup

- Add environment variable `CLERK_WEBHOOK_SIGNING_SECRET` with the signing secret from the Clerk webhook endpoint.

---

## Story 5: A User Can Create an Organization and Become an Employer

A signed-in user can create a Clerk organization, which makes them an employer with access to the `/company` area. Organizations have roles that control what each member can do.

### Requirements

- When a user creates an organization in Clerk, the webhook (Story 4) automatically creates a corresponding `companies` record and a `companyMembers` record with the `"admin"` role.
- The `/company` routes require both authentication and an active organization (enforced by the middleware in Story 2).
- Three roles exist: `org:admin` (full access), `org:recruiter` (can post jobs and review applications), `org:member` (read-only access).

### Clerk Dashboard setup -- Organizations

- Enable Organizations in the Clerk dashboard.
- Create three custom roles: `org:admin`, `org:recruiter`, `org:member`.
- Create three permissions: `org:team_management:invite`, `org:job_posting:manage`, `org:applicant_review:decide`.
- Assign permissions to roles: admin gets all three permissions, recruiter gets `org:job_posting:manage` and `org:applicant_review:decide`, member gets none.

### Clerk Dashboard setup -- Billing

- Set up three billing plans (per-organization billing):
  - **Free** (default, no cost): 1 seat, 1 active job.
  - **Starter**: 3 seats, 5 active jobs. Includes features `team_management` and `job_posting`.
  - **Growth**: 10 seats, 25 active jobs. Includes features `team_management`, `job_posting`, and `advanced_filters`.
- Configure three features in Clerk: `team_management`, `job_posting`, `advanced_filters`.

---

## Story 6: Shared UI Components Are Available

Before building feature pages, several reusable components and utilities need to exist. These are used throughout the candidate and company areas.

### Requirements

- **shadcn/ui components**: install button, card, form, input, textarea, label, checkbox, badge, select, and popover using `pnpm dlx shadcn@latest add button card form input textarea label checkbox badge select popover`.
- **Rich text editor** at `components/rich-text-editor.tsx`: a TipTap editor using StarterKit and the Placeholder extension. Provides a toolbar with Bold, Italic, H2, H3, Bullet List, and Ordered List buttons.
- **Rich text display** at `components/rich-text-display.tsx`: renders HTML content safely using `dangerouslySetInnerHTML` with the `prose-job` CSS class for styled output.
- **Notification bell** at `components/notification-bell.tsx`: a popover triggered by a bell icon that shows unread notification count (capped at "9+"), lists the last 10 notifications with type-specific icons (green checkmark for accepted, red X for rejected, amber file for in_review, blue file for application_received, briefcase for job_closed, info circle for system), relative timestamps ("just now", "Xm ago", "Xh ago", "Xd ago", or a date), a "Mark all read" button when unread exist, click-to-navigate behavior that auto-marks the notification as read, and a "View all notifications" link to `/notifications`. Defers popover rendering until after mount to avoid hydration mismatch.
- **Utility: `lib/strip-html.ts`** -- a `stripHtml` function that removes HTML tags from strings.
- **Utility: `lib/use-debounced-value.ts`** -- a `useDebouncedValue` React hook that delays value updates by a configurable number of milliseconds.

---

## Story 7: A Candidate Can Build Their Profile

A signed-in candidate can create and edit their professional profile, including personal details, work experience, education, certifications, and skills.

### Requirements

- **Candidate layout** at `app/(app)/layout.tsx`: a sticky header with backdrop blur containing `SiteLogo`, desktop navigation links (Jobs, Applications, Saved -- with jade highlight on the active route), the `NotificationBell` component, and a `UserButton` with custom menu items linking to "Edit my Profile" (`/profile`), "Experience" (`/profile#experience`), and "Resume" (`/profile#resume`). On mobile, a fixed bottom navigation bar with Jobs, Applications, Alerts (linking to `/notifications`), and Saved.
- **Profile page** at `app/(app)/profile/page.tsx`: a comprehensive profile management page with the following sections:
  - **Profile header**: a gradient banner, the user's avatar (from Clerk), and an "Open to work" toggle badge.
  - **About section**: an inline-editable form for `firstName`, `lastName`, `headline`, `bio` (rich text), `summary`, `location`, `phone`, `website`, `linkedinUrl`, `githubUrl`, and `yearsExperience`.
  - **Skills section**: a comma-separated text input that produces pill badges.
  - **Experience section**: add/edit/delete entries with fields for title, company, location, start date, end date, "currently working here" toggle, and description (rich text). Entries are ordered and the order auto-increments.
  - **Education section**: add/edit/delete entries with school, degree, field of study, start date, end date, and description. Ordered with auto-increment.
  - **Certifications section**: add/edit/delete with name, issuing organization, issue date, expiration date, and credential URL.

### Backend functions (`convex/profiles.ts`)

- `getMyProfile` -- returns the user record, profile, resumes (with signed file URLs), experiences (sorted by order), education (sorted by order), and certifications.
- `getPublicProfile` -- same data shape but for viewing another user's profile by ID.
- `upsertMyProfile` -- creates or patches the profile. Skills are normalized (trimmed, empty strings removed).
- Experience CRUD: `addExperience`, `updateExperience`, `deleteExperience` -- each checks ownership (userId must match). Order auto-increments based on existing count.
- Education CRUD: `addEducation`, `updateEducation`, `deleteEducation` -- ownership check, auto-incrementing order.
- Certification CRUD: `addCertification`, `updateCertification`, `deleteCertification` -- ownership check.

---

## Story 8: A Candidate Can Upload and Manage Resumes

A candidate can upload resume files to their profile, download them, set a default, and delete them.

### Requirements

- The resume upload section on the profile page supports drag-and-drop file upload.
- Uploaded files appear in a list showing title, file name, file size, a download link, and a "default" badge on the default resume.
- Deleting a resume removes it from Convex file storage. If the deleted resume was the default, the most recent remaining resume automatically becomes the new default.

### Restrictions

- **Maximum file size**: 10 MB per file.
- **Maximum files per user**: 10 resumes.
- The first uploaded resume is automatically set as the default.

### Backend functions (in `convex/profiles.ts`)

- `generateUploadUrl` -- generates a Convex file storage upload URL.
- `saveResume` -- validates the 10 MB limit and the 10-file-per-user limit, stores the file metadata, and marks the first file as default.
- `deleteResume` -- deletes the file from Convex storage and the database record. If it was the default, assigns the most recent remaining resume as the new default.
- `getFileUrl` -- returns a signed URL for a given storage ID.

---

## Story 9: A Candidate Can Search and Browse Jobs

A candidate can browse active job listings with full-text search and multiple filters.

### Requirements

- **Job search page** at `app/(app)/jobs/page.tsx` with:
  - A search text input (debounced) for keyword search across job titles, descriptions, locations, company names, and tags.
  - A location text input for filtering by location.
  - A workplace type dropdown: on_site, hybrid, remote.
  - An employment type dropdown: full_time, part_time, contract, internship, temporary.
  - Job cards showing: company name, job title, location, salary range (formatted as currency), employment type badge, workplace type badge, tags as pill badges, and posted date.
  - A heart icon on each card to save/unsave the job as a favorite.
  - An empty state illustration when no results match.

### Backend functions (`convex/jobs.ts` -- search-related)

- `searchJobListings` -- uses the `search_jobs` full-text search index when search text is provided, applying index-level filters for `companyId`, `workplaceType`, and `employmentType`. Additional in-memory filters are applied for `location` (substring match), `minSalary`, and `tags` (all required tags must be present). Results are deduplicated and capped at 100.
- `listRecentJobs` -- returns active jobs in descending creation order, capped at 100. Used on the server-side rendering demo page.
- `getJobListingById` -- a public query that returns a single job by ID. No authentication required.

---

## Story 10: A Candidate Can View Job Details and Apply

A candidate can open a job listing to see its full details and submit an application.

### Requirements

- **Job detail page** at `app/(app)/jobs/[jobId]/page.tsx` with:
  - Full job details: company name, title, location, salary range, employment type, workplace type.
  - Rich text description rendered with `prose-job` styling.
  - Tags displayed as pill badges.
  - A save/favorite toggle button.
  - A profile preview section (expandable) that shows the candidate's current profile data.
  - An apply form with a cover letter textarea and a resume selector (dropdown of uploaded resumes).
  - A profile completeness check -- the apply button is disabled with a message if the candidate's `firstName` or `lastName` is missing.

### Application restrictions

- Cannot apply to inactive jobs (throws "This job is unavailable").
- Cannot apply twice to the same job -- unless the previous application was withdrawn, in which case the existing record is updated back to `"submitted"` status.
- A valid resume ID (if provided) must belong to the current user.
- Profile must have at least `firstName` and `lastName` filled in.

### Notification trigger

- When a candidate applies, an `"application_received"` notification is sent to the user who posted the job (`postedByUserId`). The notification title is "New application received", the message says "A candidate applied for [job title]", and the link URL is `/company/applications`.

### Backend function (`convex/applications.ts`)

- `applyToJob` -- validates all restrictions above, creates or updates the application record, increments the `applicationCount` on the job listing, and fires the notification.

---

## Story 11: A Candidate Can Save Jobs to Favorites

A candidate can save interesting jobs and view them later on a dedicated page.

### Requirements

- **Favorites page** at `app/(app)/favorites/page.tsx`: lists all saved jobs with full job details (title, company, location, salary, type badges). Each card has a remove button. Shows an empty state when no favorites exist.
- The heart icon on job cards (search page) and job detail pages toggles the favorite on/off.
- Adding a favorite is idempotent -- if already favorited, it returns the existing record.

### Backend functions (`convex/favorites.ts`)

- `addFavorite` -- idempotent, returns existing ID if already favorited.
- `removeFavorite` -- deletes by `userId` + `jobId`.
- `isJobFavorited` -- returns a boolean for a specific job.
- `listMyFavorites` -- returns favorites joined with job details, sorted descending, limit 50-200.

---

## Story 12: A Candidate Can Track Their Applications

A candidate can see all their submitted applications, filter by status, and withdraw pending ones.

### Requirements

- **Applications page** at `app/(app)/applications/page.tsx` with:
  - A status filter dropdown showing counts per status: all, submitted, in_review, accepted, rejected, withdrawn.
  - Expandable application cards showing: job title, company name, status badge (color-coded), application date, and cover letter.
  - Status badge colors: blue for submitted, amber for in_review, green for accepted, red for rejected, gray for withdrawn.
  - A withdraw button on each card.

### Withdrawal restriction

- A candidate **cannot withdraw** an application that has been finalized (status is `"accepted"` or `"rejected"`). The withdraw button is disabled for these.

### Backend functions (`convex/applications.ts`)

- `listMyApplications` -- returns the candidate's applications joined with job details, sorted descending by creation date, limit 50-200.
- `withdrawApplication` -- validates that the application belongs to the current user and that the status is not `"accepted"` or `"rejected"`. Sets status to `"withdrawn"`.

---

## Story 13: A User Receives Real-Time Notifications

Users receive notifications for important events. They can view, filter, and mark notifications as read.

### Requirements

- **Notification bell** (built in Story 6) appears in both candidate and company layouts, showing the unread count and a dropdown with recent notifications.
- **Notifications page** at `app/(app)/notifications/page.tsx` with:
  - A filter toggle: All / Unread only.
  - A "Mark all as read" button (visible when unread notifications exist).
  - Notification cards showing: type-specific icon, title, message, relative timestamp, and read/unread visual state (unread cards have a jade background tint and a small green dot).
  - Clicking a notification marks it as read and navigates to its `linkUrl`.

### All notification triggers in the app

1. **Candidate applies to a job** -- `"application_received"` sent to the job poster. Title: "New application received". Link: `/company/applications`.
2. **Company moves application to review** -- `"application_status"` sent to the applicant. Title: "Application in review".
3. **Company accepts an application** -- `"application_status"` sent to the applicant. Title: "Congratulations! You've been accepted". If the job has `autoCloseOnAccept` enabled and the job is still active, the job is also closed and all OTHER pending applicants (submitted + in_review) receive a `"job_closed"` notification.
4. **Company rejects an application** -- `"application_status"` sent to the applicant. Title: "Application rejected".
5. **Company manually closes a job** -- `"job_closed"` sent to ALL pending applicants (submitted + in_review). Title: "Job listing closed". Message: "[job title] at [company name] is no longer accepting applications". Link: `/applications`.

### Notification types

- `"application_status"` -- status change on the candidate's application.
- `"application_received"` -- new application received by the company.
- `"job_closed"` -- a job the candidate applied to was closed.
- `"system"` -- reserved for system-wide announcements.

### Backend functions (`convex/notifications.ts`)

- `createNotification` -- **internal only** (not callable from the client). Called from application and job mutations.
- `listMyNotifications` -- returns notifications for the current user, supports `unreadOnly` filter, sorted descending, limit 50-200.
- `getUnreadNotificationCount` -- returns the count of unread notifications.
- `markNotificationRead` -- sets `isRead` to true and records `readAt`. Validates ownership.
- `markAllNotificationsRead` -- bulk-marks all unread notifications as read for the current user.

---

## Story 14: An Employer Can View Their Company Dashboard

An employer who has selected an organization sees a dashboard with key metrics, quick actions, team management, and billing information.

### Requirements

- **Company layout** at `app/company/layout.tsx` (client component):
  - Header with `SiteLogo`, a "Recruiter" badge, desktop nav (Dashboard, Jobs, Applications), the `OrganizationSwitcher` (with `hidePersonal`), `NotificationBell`, and `UserButton`.
  - **Role-gated nav items**: "Post job" link is only visible to admin and recruiter roles (wrapped in Clerk's `Protect` component checking `has({ role: "org:admin" })` or `has({ role: "org:recruiter" })`). "Billing" link is only visible to admins (`Protect` with `role="org:admin"`).
  - Mobile bottom nav with the same role gating.
  - A `SyncCompanyPlan` component is rendered in the layout body (see below).
- **Dashboard page** at `app/company/page.tsx` (server component):
  - Shows "Select an organization" empty state if no `orgId`.
  - `CompanySummaryCards`: four metric cards showing organization name, user's role, active job count, and pipeline stats (X new submissions + Y in review).
  - Quick actions section: "View all jobs" link + "Post new job" button (role-gated to admin/recruiter) + "Review applications" link.
  - `InviteMemberSection` (see Story 20).
  - `BillingSection` (see Story 19).

### Plan sync mechanism

- `app/company/_components/sync-company-plan.tsx`: a client component that reads the current plan from Clerk's `useAuth` hook by checking `has({ plan: "starter" })` and `has({ plan: "growth" })`. It determines the plan tier (growth > starter > free), calculates the corresponding seat and job limits, and calls the `syncCompanyPlan` mutation once per `orgId` (uses a ref to prevent duplicate calls).

### Backend functions (`convex/companies.ts`)

- `getMyCompanyContext` -- resolves the company from `clerkOrgId`, returns `companyId`, `companyName`, `companySlug`, `role`, `clerkOrgId`, `jobLimit`, and `seatLimit`. Limits are computed from the plan: free = 1 seat / 1 job, starter = 3 seats / 5 jobs, growth = 10 seats / 25 jobs.
- `getCompanyUsage` -- returns `activeMemberCount`, `invitedMemberCount`, `activeJobCount`, `totalJobCount`.
- `syncCompanyPlan` -- updates the company's `plan`, `seatLimit`, and `jobLimit`. Requires active membership.

---

## Story 15: An Employer Can Post a New Job

An admin or recruiter can create a new job listing that becomes immediately visible to candidates.

### Requirements

- **Create job page** at `app/company/jobs/new/page.tsx`:
  - The form is only accessible to admins and recruiters. Members see a "Read-only access -- Only admins and recruiters can create job listings" message.
  - Form fields: job title, description (rich text editor), location, employment type (5 options: full_time, part_time, contract, internship, temporary), workplace type (3 options: on_site, hybrid, remote), salary min, salary max, salary currency, tags (comma-separated), and an "Auto-close after first accepted applicant" checkbox.
  - Uses `react-hook-form` with validation (title, description, location, salaryMin, salaryMax, and currency are required).
  - On submit, redirects to `/company/jobs`.

### Job limit enforcement

- The page checks the current active job count against the plan's job limit. If at the limit, a warning card is shown: "Active job limit reached (X/Y). Upgrade your plan or close a job to open a new listing." with a link to `/company/billing`. The submit button is disabled.
- Plan limits: Free = 1 active job, Starter = 5, Growth = 25.

### Backend restrictions (`convex/jobs.ts` -- `createJobListing`)

- Requires `admin` or `recruiter` role (via `requireCompanyRole`).
- Enforces the plan-based job limit -- counts active jobs for the company and compares against `jobLimit`.
- Validates that `salaryMin` is not greater than `salaryMax`.
- Normalizes tags to lowercase and trims whitespace.
- Builds a `searchText` field by concatenating title, stripped-HTML description, location, company name, and tags -- all lowercased. This powers full-text search.

---

## Story 16: An Employer Can Manage Job Listings

An employer can view, edit, close, and reopen their company's job listings.

### Requirements

- **Jobs management page** at `app/company/jobs/page.tsx`:
  - Two tabs: Active and Closed.
  - Job cards showing: title, location, applicant count, posted date.
  - **Role-gated actions**: only admins and recruiters can close/reopen jobs, edit jobs, and toggle the auto-close setting. Members see the listings in read-only mode.
  - Each job card expands to show a list of applicants with their status badges and quick status-update buttons.
- **Edit job page** at `app/company/jobs/[jobId]/edit/page.tsx`:
  - Same fields as the create form, pre-filled with existing values.
  - Only accessible to admins and recruiters.

### Closing a job -- notification trigger

- When an admin or recruiter closes a job, ALL applicants whose status is `"submitted"` or `"in_review"` receive a `"job_closed"` notification with title "Job listing closed" and a message "[job title] at [company name] is no longer accepting applications". Link: `/applications`.

### Backend functions (`convex/jobs.ts`)

- `listCompanyJobs` -- requires company membership (any role). Optionally includes closed jobs. Sorted descending, limit 50-200.
- `updateJobListing` -- requires admin/recruiter role. Validates ownership (job must belong to the company). Rebuilds `searchText` whenever title, description, location, or tags change.
- `closeJobListing` -- requires admin/recruiter. Sets `isActive` to false, records `closedAt`, and sends `"job_closed"` notifications to all pending applicants.

---

## Story 17: An Employer Can Review Applications

Admins and recruiters can review candidate applications, view full profiles, and make hiring decisions. Members can view applications but cannot make decisions.

### Requirements

- **Applications review page** at `app/company/applications/page.tsx`:
  - A status filter dropdown showing counts per status (all, submitted, in_review, accepted, rejected, withdrawn).
  - Expandable applicant cards showing: avatar, full name, "Open to work" badge (if enabled), headline, email, the job they applied for, and application date.
  - On wider screens, a quick stats row: experience count, education count, skills count.
  - **Expanded profile view**: summary, cover letter, experience timeline (title, company, location, dates, rich text description), education entries, certifications (with credential links), skills badges, contact info (email, phone, location, LinkedIn, GitHub, website), resume download links with file size, and a years-of-experience stat card.
  - **Decision actions** (admin/recruiter only): three buttons -- "Move to review" (sets `in_review`), "Accept candidate" (sets `accepted`), "Reject candidate" (sets `rejected`). Each button is disabled if the application is already in that status. Members see "Read-only access for your role" instead of action buttons.
  - Status badges: blue = submitted, amber = in_review, green = accepted, red = rejected, gray = withdrawn.

### Advanced filters (Growth plan feature gate)

- **Only visible when `has({ feature: "advanced_filters" })` is true** (Growth plan).
- Skills filter: comma-separated text input, debounced at 1000ms. Performs fuzzy matching -- a filter skill matches if any profile skill contains it or vice versa.
- Min/max years experience: numeric inputs, debounced at 1000ms.
- Clear filters button to reset all advanced filters.
- On the backend, advanced filtering only runs when `company.plan === "growth"` AND at least one advanced filter is provided.

### Auto-close on accept behavior

- When an application is accepted and the job has `autoCloseOnAccept` set to true and the job is still active:
  1. The job is closed (`isActive` = false, `closedAt` = now).
  2. ALL other applicants with `"submitted"` or `"in_review"` status receive a `"job_closed"` notification.

### Notification triggers from status updates

- Moving to review: `"application_status"` notification to the applicant.
- Accepting: `"application_status"` notification with title "Congratulations! You've been accepted" plus potential auto-close notifications (above).
- Rejecting: `"application_status"` notification to the applicant.
- All status updates record `decidedByUserId` and `decidedAt` on the application.

### Backend functions (`convex/applications.ts`)

- `listCompanyApplications` -- requires company membership (any role). Returns applications with full applicant data: user, profile, experiences (sorted by order), education (sorted by order), certifications, and resumes (with signed URLs). Supports `status`, `jobId`, `skills`, `minYearsExperience`, and `maxYearsExperience` filters.
- `updateApplicationStatus` -- requires admin/recruiter role. Validates the application exists and belongs to the company. Handles auto-close logic and fires all relevant notifications.

---

## Story 18: An Admin Can Manage Billing and Plans

An organization admin can view their current plan, see feature access, monitor usage, and change plans.

### Requirements

- **Billing page** at `app/company/billing/page.tsx` (server component):
  - **Current plan summary card**: displays the plan name (free/starter/growth), seat limit, and job limit.
  - **Feature access matrix**: four rows showing Active/Locked status for:
    - Starter plan -- `has({ plan: "starter" })`
    - Growth plan -- `has({ plan: "growth" })`
    - Advanced filters -- `has({ feature: "advanced_filters" })`
    - Team invite permission -- `has({ permission: "org:team_management:invite" })`
  - **Usage cards** (`app/company/_components/billing-usage-cards.tsx`): two cards showing real-time usage vs limits:
    - Seats: active member count vs seat limit, with a progress bar (green normally, amber when >= 80% or over limit). Shows "X invited pending" as helper text and an "Over limit" warning badge when exceeded.
    - Active jobs: active job count vs job limit, same progress bar behavior. Shows "X total listings" as helper text.
  - **PricingTable**: Clerk's `PricingTable` component with `for="organization"`, wrapped in `Protect` with `role="org:admin"`. Non-admins see "Only organization admins can change billing plans" instead.

### Billing section on the dashboard (`app/company/_components/billing-section.tsx`)

- Wrapped in `Protect` with `role="org:admin"` -- non-admins see "Only organization admins can manage billing".
- Six feature cards showing enabled/locked status:
  - "Team invites" -- enabled if `has({ feature: "team_management" })` AND `has({ permission: "org:team_management:invite" })`.
  - "Job posting" -- enabled if `has({ feature: "job_posting" })`.
  - "Job management" -- enabled if admin or recruiter role.
  - "Advanced filters" -- enabled if `has({ feature: "advanced_filters" })`. Shows "Growth" plan hint when locked.
  - "10 team seats" -- enabled if `has({ plan: "growth" })`. Shows "Growth" plan hint when locked.
  - "25 active jobs" -- enabled if `has({ plan: "growth" })`. Shows "Growth" plan hint when locked.
- Locked feature cards link to `/company/billing` for upgrade.
- "Manage billing" button + "Upgrade plan" button (hidden when already on Growth plan).

---

## Story 19: The Pricing Page Helps Users Choose a Plan

The public pricing page guides users through organization creation and plan selection.

### Requirements

- **Pricing page** at `app/pricing/page.tsx` (server component) with three conditional states:
  1. **No organization**: shows Clerk's `CreateOrganization` component with `afterCreateOrganizationUrl` set to `/pricing`, prompting the user to create a company workspace first.
  2. **Has organization but not admin**: shows a lock icon and message "Only admins can manage plans" with an `OrganizationSwitcher` to let the user switch to an org where they are admin.
  3. **Admin with organization**: shows Clerk's `PricingTable` with `for="organization"` and an `OrganizationSwitcher` above it for multi-org users.

---

## Story 20: An Admin Can Invite Team Members

An organization admin (or anyone with the invite permission) can invite new members to the organization, choosing their role.

### Requirements

- **Invite section** on the dashboard (`app/company/_components/invite-member-section.tsx`):
  - **Visibility gate**: only rendered if BOTH `has({ permission: "org:team_management:invite" })` AND `has({ feature: "team_management" })` are true. If either is false, the section is completely hidden.
  - An email address input, a role selector (Member = `org:member`, Admin = `org:admin`, Recruiter = `org:recruiter`), and a "Send invitation" button.
  - A progress bar showing current team member count vs seat limit, with the same color coding as the billing usage cards (green, amber at 80%, "Over limit" warning).
  - Shows "X invited pending" count.

### Seat limit enforcement

- The invite form is **disabled** when `activeMemberCount + invitedMemberCount >= seatLimit`. The message changes to "Seat limit reached. Upgrade to invite more."
- Plan limits: Free = 1 seat, Starter = 3 seats, Growth = 10 seats.

### Server action (`app/company/actions.ts`)

- `inviteOrganizationMember(emailAddress, role, appOrigin)`:
  - Checks `has({ permission: "org:team_management:invite" })` -- returns error if false.
  - Fetches company context and usage from Convex using `fetchQuery` with a Convex JWT token (obtained via `getToken({ template: "convex" })`).
  - Checks seat limit: if `activeMemberCount + invitedMemberCount >= seatLimit`, returns an error with the message "Seat limit reached (X/Y). Upgrade your plan to invite more members."
  - Calls `clerkClient().organizations.createOrganizationInvitation()` with `organizationId`, `inviterUserId`, `emailAddress`, `role`, and `redirectUrl` (constructed from `appOrigin`).

---

## Story 21: Plan Limits Restrict Job Posting and Team Size

The billing plan enforces hard limits on how many active jobs and team members an organization can have. These limits are checked on both the frontend (disabling UI) and the backend (throwing errors).

### Plan limits summary

| Plan | Seats | Active Jobs | Features |
|------|-------|-------------|----------|
| Free | 1 | 1 | None |
| Starter | 3 | 5 | `team_management`, `job_posting` |
| Growth | 10 | 25 | `team_management`, `job_posting`, `advanced_filters` |

### Where limits are enforced

- **Job creation** (Story 15): backend `createJobListing` counts active jobs and compares against `jobLimit`. Frontend shows a warning and disables the submit button when at the limit.
- **Team invites** (Story 20): server action checks `activeMemberCount + invitedMemberCount` against `seatLimit`. Frontend disables the form when at the limit.
- **Advanced filters** (Story 17): only available to Growth plan users. Frontend checks `has({ feature: "advanced_filters" })` to show/hide the filter UI. Backend only applies advanced filter logic when `company.plan === "growth"`.

### Feature gating with `has()` -- complete reference

**Role checks**:
- `has({ role: "org:admin" })` -- billing, plan changes, all permissions.
- `has({ role: "org:recruiter" })` -- job posting, application review.
- `has({ role: "org:member" })` -- read-only access.

**Plan checks**:
- `has({ plan: "starter" })` -- determines if on starter tier or above.
- `has({ plan: "growth" })` -- determines if on growth tier.

**Feature checks**:
- `has({ feature: "team_management" })` -- enables team invite UI.
- `has({ feature: "job_posting" })` -- enables job posting features.
- `has({ feature: "advanced_filters" })` -- enables skills/experience filters on applications page.

**Permission checks**:
- `has({ permission: "org:team_management:invite" })` -- can invite members.
- `has({ permission: "org:job_posting:manage" })` -- can manage job listings.
- `has({ permission: "org:applicant_review:decide" })` -- can make hiring decisions.

---

## Story 22: Server-Side Rendering Works with Convex

The app demonstrates Convex server-side preloading for faster initial page loads.

### Requirements

- **Server page** at `app/server/page.tsx`: a server component that calls `preloadQuery(api.jobs.listRecentJobs)` and passes the preloaded data to an inner client component.
- **Inner component** at `app/server/inner.tsx`: a client component that calls `usePreloadedQuery` to render the preloaded job data without a loading state on initial render.

---

## Story 23: Seed Data Populates the App for Demo Purposes

For demo purposes, the app can be seeded with realistic test data using a Convex internal mutation.

### Requirements

- **Seed function** at `convex/seed.ts` (internal mutation -- not callable from the client directly):
  - Creates 40 users with realistic first and last names.
  - Creates profiles for each user with randomized skills (from a pool of 30+ skills), work experiences (with realistic titles, companies, and date ranges), education entries, and certifications.
  - Creates 12 companies with admin and recruiter members.
  - Creates approximately 6 jobs per company with realistic titles, descriptions, salary ranges, and tags.
  - Creates applications with various statuses (submitted, in_review, accepted, rejected, withdrawn).
  - Creates favorites linking users to random jobs.
  - Creates notifications for users based on their application activity.
  - Includes special handling for a real user account to ensure it has guaranteed data.
- Additional utility mutations: `clearSeedData` (removes seeded data while preserving real users/companies), `seedOrgApplications` (seeds applications for a specific organization), `recalculateApplicationCounts` (fixes job application count mismatches), and `resyncClerk` (manual sync helper).

---

## Appendix: Complete Notification Reference

| # | Trigger | Type | Recipient | Title | Link |
|---|---------|------|-----------|-------|------|
| 1 | Candidate applies to job | `application_received` | Job poster | "New application received" | `/company/applications` |
| 2 | Company moves app to review | `application_status` | Applicant | "Application in review" | `/jobs/[jobId]` |
| 3 | Company accepts application | `application_status` | Applicant | "Congratulations! You've been accepted" | `/jobs/[jobId]` |
| 4 | Accept triggers auto-close | `job_closed` | All other pending applicants | "Job listing closed" | `/applications` |
| 5 | Company rejects application | `application_status` | Applicant | "Application rejected" | `/jobs/[jobId]` |
| 6 | Company manually closes job | `job_closed` | All pending applicants | "Job listing closed" | `/applications` |

## Appendix: Complete File Structure

```
app/
  layout.tsx                          -- Root layout (ClerkProvider, ConvexProvider, fonts, Toaster)
  page.tsx                            -- Landing page
  globals.css                         -- Design system (themes, animations, utilities)
  (app)/
    layout.tsx                        -- Candidate layout (nav, NotificationBell, UserButton)
    jobs/
      page.tsx                        -- Job search with filters
      [jobId]/page.tsx                -- Job detail + apply form
    applications/page.tsx             -- Candidate application tracking
    favorites/page.tsx                -- Saved jobs
    notifications/page.tsx            -- Notification inbox
    profile/page.tsx                  -- Profile management (about, experience, education, certs, resumes)
  company/
    layout.tsx                        -- Company layout (org switcher, role-gated nav, SyncCompanyPlan)
    page.tsx                          -- Company dashboard
    actions.ts                        -- Server action: inviteOrganizationMember
    _components/
      company-summary-cards.tsx       -- Dashboard metric cards
      billing-section.tsx             -- Feature gating display
      billing-usage-cards.tsx         -- Seats + jobs usage bars
      invite-member-section.tsx       -- Team invite form with seat limit
      sync-company-plan.tsx           -- Syncs Clerk plan to Convex
    jobs/
      page.tsx                        -- Job listings management (active/closed tabs)
      new/page.tsx                    -- Create job form
      [jobId]/edit/page.tsx           -- Edit job form
    applications/page.tsx             -- Application review with advanced filters
    billing/page.tsx                  -- Billing management page
  pricing/page.tsx                    -- Public pricing page
  sign-in/[[...sign-in]]/page.tsx     -- Custom sign-in page
  sign-up/[[...sign-up]]/page.tsx     -- Custom sign-up page
  server/
    page.tsx                          -- SSR demo (server component)
    inner.tsx                         -- SSR demo (client component)
components/
  ConvexClientProvider.tsx            -- Convex + Clerk provider wrapper
  notification-bell.tsx               -- Notification popover
  rich-text-editor.tsx                -- TipTap editor with toolbar
  rich-text-display.tsx               -- HTML content renderer
  site-logo.tsx                       -- App logo link
  ui/                                 -- shadcn/ui components (button, card, form, input, etc.)
convex/
  schema.ts                           -- Full database schema (12 tables)
  auth.config.ts                      -- Clerk JWT config for Convex
  http.ts                             -- Webhook HTTP endpoint
  sync.ts                             -- 6 internal webhook sync mutations
  profiles.ts                         -- Profile, experience, education, cert, resume CRUD
  jobs.ts                             -- Job create, update, close, search, list
  applications.ts                     -- Apply, status update, withdraw, list
  notifications.ts                    -- Create (internal), list, mark read
  favorites.ts                        -- Add, remove, check, list
  companies.ts                        -- Company context, usage, plan sync
  seed.ts                             -- Seed data generator
  lib/
    auth.ts                           -- Auth helpers (requireIdentity, getViewerUser, etc.)
    companies.ts                      -- Company helpers (requireCompany, requireRole, etc.)
lib/
  utils.ts                            -- cn() helper
  convex-error.ts                     -- getErrorMessage() helper
  strip-html.ts                       -- stripHtml() helper
  use-debounced-value.ts              -- useDebouncedValue() hook
proxy.ts                              -- Next.js 16 Clerk middleware
```
