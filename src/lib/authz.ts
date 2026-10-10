import db from "@/lib/db";
import { currentUser } from "@/modules/authentication/action";

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireWorkspaceMember(workspaceId: string) {
  const user = await requireUser();
  const member = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
  });
  if (!member) throw new Error("Forbidden");
  return { user, member };
}

export async function requireCollectionAccess(collectionId: string) {
  const user = await requireUser();
  const collection = await db.collection.findUnique({
    where: { id: collectionId },
  });
  if (!collection) throw new Error("Collection not found");
  await requireWorkspaceMember(collection.workspaceId);
  return { user, collection };
}

export async function requireRequestAccess(requestId: string) {
  const user = await requireUser();
  const request = await db.request.findUnique({ where: { id: requestId } });
  if (!request) throw new Error("Request not found");
  await requireCollectionAccess(request.collectionId);
  return { user, request };
}

export async function requirePresetAccess(presetId: string) {
  const user = await requireUser();
  const preset = await db.webSocketPreset.findUnique({
    where: { id: presetId },
  });
  if (!preset || !preset.workspaceId) throw new Error("Preset not found");
  await requireWorkspaceMember(preset.workspaceId);
  return { user, preset };
}
