"use server";

import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";

export const currentUser = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    return await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    // Let Next.js internal signals (dynamic rendering, redirects) pass through.
    unstable_rethrow(error);
    console.error("Error fetching current user:", error);
    return null;
  }
};
