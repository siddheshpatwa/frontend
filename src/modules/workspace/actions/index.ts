"use server";
import db from "@/lib/db";
import { currentUser } from "@/modules/authentication/action";
import { MEMBER_ROLE } from "@/generated/prisma/client";
import { requireUser, requireWorkspaceMember } from "@/lib/authz";

export const initializeWorkspace = async () => {
  const user = await currentUser();
  if (!user) {
    return {
      success: false,
      error: "user not found !!",
    };
  }

  try {
    const workspace = await db.workspace.upsert({
      where: {
        name_ownerId: {
          name: "Personal Workspace",
          ownerId: user.id,
        },
      },
      update: {},
      create: {
        name: "Personal Workspace",
        ownerId: user.id,
        description: "default workspace",
        members: {
          create: {
            userId: user.id,
            role: MEMBER_ROLE.ADMIN,
          },
        },
      },
      include: {
        members: true,
      },
    });
    return {
      success: true,
      workspace,
    };
  } catch (error) {
    console.error("WORKSPACE INITIALIZATION ERROR:", error);
    return {
      success: false,
      error: "Failed to initialize workspace",
    };
  }
};

export const getWorkspaces = async () => {
  const user = await requireUser();
  return db.workspace.findMany({
    where: {
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    orderBy: { createdAt: "asc" },
  });
};

export const createWorkspace = async (name: string) => {
  const user = await requireUser();
  const trimmed = name?.trim();
  if (!trimmed) throw new Error("Workspace name is required");

  return db.workspace.create({
    data: {
      name: trimmed,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: MEMBER_ROLE.ADMIN,
        },
      },
    },
  });
};

export const getWorkspaceById = async (id: string) => {
  await requireWorkspaceMember(id);
  return db.workspace.findUnique({
    where: { id },
    include: { members: true },
  });
};
