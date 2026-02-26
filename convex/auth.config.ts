import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Configure this env var in your Convex deployment settings.
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
