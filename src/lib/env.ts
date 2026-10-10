import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        GoogleClientId: z.string().min(1),
        GoogleClientSecret: z.string().min(1),
        GitHubClientId: z.string().min(1),
        GitHubClientSecret: z.string().min(1),
    },
    experimental__runtimeEnv: process.env,
    // Build machines often have no secrets. Validation still runs when the app starts.
    skipValidation:
        !!process.env.SKIP_ENV_VALIDATION ||
        process.env.NEXT_PHASE === "phase-production-build",
})
