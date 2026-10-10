"use server";

import db from "@/lib/db";
import { requireCollectionAccess, requireWorkspaceMember } from "@/lib/authz";

export const createCollections = async (workspaceId: string, name: string) => {
  await requireWorkspaceMember(workspaceId);
  const trimmed = name?.trim();
  if (!trimmed) throw new Error("Collection name is required");

  return db.collection.create({
    data: {
      name: trimmed,
      workspace: { connect: { id: workspaceId } },
    },
  });
};

export const getCollection = async (workspaceId: string) => {
  await requireWorkspaceMember(workspaceId);
  return db.collection.findMany({ where: { workspaceId } });
};

export const deleteCollection = async (collectionId: string) => {
  await requireCollectionAccess(collectionId);
  return db.collection.delete({ where: { id: collectionId } });
};

export const editCollection = async (collectionId: string, name: string) => {
  await requireCollectionAccess(collectionId);
  const trimmed = name?.trim();
  if (!trimmed) throw new Error("Collection name is required");

  return db.collection.update({
    where: { id: collectionId },
    data: { name: trimmed },
  });
};
