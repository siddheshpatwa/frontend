"use server";

import { MEMBER_ROLE } from "@/generated/prisma/enums";
import db from "@/lib/db";
import { requireUser, requireWorkspaceMember } from "@/lib/authz";
import { randomBytes } from "crypto";
import { headers } from "next/headers";

async function appBaseUrl() {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export const generateWorkspaceInvite = async (workspaceId: string) => {
  const { user, member } = await requireWorkspaceMember(workspaceId);
  if (member.role !== MEMBER_ROLE.ADMIN) {
    throw new Error("Only workspace admins can create invites");
  }

  const token = randomBytes(16).toString("hex");
  const invite = await db.workspaceInvite.create({
    data: {
      workspaceId,
      token,
      createdById: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  return `${await appBaseUrl()}/invite/${invite.token}`;
};

export const acceptWorkspaceInvite = async (token: string) => {
  const user = await requireUser();

  const invite = await db.workspaceInvite.findUnique({ where: { token } });
  if (!invite) throw new Error("Invalid invite");
  if (!invite.expiresAt || invite.expiresAt < new Date()) {
    throw new Error("Invite expired");
  }

  const existing = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: { userId: user.id, workspaceId: invite.workspaceId },
    },
  });

  if (!existing) {
    await db.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: invite.workspaceId,
        role: MEMBER_ROLE.VIEWER,
      },
    });
  }

  await db.workspaceInvite.delete({ where: { id: invite.id } });

  return { success: true, alreadyMember: !!existing };
};

export const getAllWorkspaceMembers = async (workspaceId: string) => {
  await requireWorkspaceMember(workspaceId);
  return db.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
};
