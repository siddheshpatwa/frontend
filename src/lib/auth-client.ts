import { createAuthClient } from "better-auth/react"

// Same-origin by default; set NEXT_PUBLIC_APP_URL only if the API lives on another origin.
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || undefined,
})

export const { signIn, signOut, useSession } = authClient
