import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "./db";
import { env } from "./env";

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql", // or "mysql", "sqlite", ...etc
    }),
    socialProviders: {
        github: {
            clientId: env.GitHubClientId || "" ,
            clientSecret: env.GitHubClientSecret || ""
        },
        google: {
            clientId: env.GoogleClientId || "",
            clientSecret: env.GoogleClientSecret || ""
        }
    },
});