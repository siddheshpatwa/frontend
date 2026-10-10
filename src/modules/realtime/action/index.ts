"use server";

import db from "@/lib/db";
import { requirePresetAccess, requireUser, requireWorkspaceMember } from "@/lib/authz";
import { 
  CreateWebSocketPresetInput, 
  UpdateWebSocketPresetInput, 
  SaveWebSocketMessageInput 
} from "../types";


export const getWebSocketPresets = async (workspaceId: string) => {
  await requireWorkspaceMember(workspaceId);
  return await db.webSocketPreset.findMany({
    where: { workspaceId },
    include: {
      websocketMessages: {
        orderBy: { timestamp: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
};


export const createWebSocketPreset = async (data: CreateWebSocketPresetInput) => {
  await requireWorkspaceMember(data.workspaceId);
  return await db.webSocketPreset.create({
    data: {
      name: data.name,
      url: data.url,
      protocols: data.protocols ?? [],
      params: data.params ?? [],
      workspaceId: data.workspaceId,
    },
  });
};

export const updateWebSocketPreset = async (
  presetId: string,
  data: UpdateWebSocketPresetInput
) => {
  await requirePresetAccess(presetId);
  return await db.webSocketPreset.update({
    where: { id: presetId },
    data:{
      name: data.name,
      url: data.url,
      protocols: data.protocols ?? [],
      params: data.params ?? [],
    },
  });
};


export const saveWebSocketMessage = async (data: SaveWebSocketMessageInput) => {
  if (data.presetId) await requirePresetAccess(data.presetId);
  else await requireUser();
  return await db.websocketMessage.create({
    data: {
      presetId: data.presetId,
      connectionId: data.connectionId,
      direction: data.direction,
      payload: data.payload,
      size: data.size,
      meta: data.meta!,
    },
  });
};


export const getWebSocketMessages = async (presetId: string) => {
  await requirePresetAccess(presetId);
  return await db.websocketMessage.findMany({
    where: { presetId },
    orderBy: { timestamp: "asc" },
  });
};