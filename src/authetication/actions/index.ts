"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";

export const currentUser = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user?.id) {
            return null;
        }
        const user = await db.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                id: true,
                email: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                name: true,
            },
        });
        return user;
    } catch (error) {
        console.log("Error fetching current user:", error);
        return null;
    }
};
