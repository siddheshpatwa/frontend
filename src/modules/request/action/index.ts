"use server";

import db from "@/lib/db";
import { REST_METHOD } from "@/generated/prisma/client";
import {
  requireCollectionAccess,
  requireRequestAccess,
  requireUser,
} from "@/lib/authz";
import { performRequest, type SendInput } from "../lib/perform";

export type Request = {
  name: string;
  method: REST_METHOD;
  url: string;
  body?: string;
  headers?: string;
  parameters?: string;
};

export const addRequestToCollection = async (
  collectionId: string,
  value: Request
) => {
  await requireCollectionAccess(collectionId);
  const request = await db.request.create({
    data: {
      collectionId,
      name: value.name,
      method: value.method,
      url: value.url,
      body: value.body,
      headers: value.headers,
      parameters: value.parameters,
    },
  });

  return request;
};

export const saveRequest = async (id: string, value: Request) => {
  await requireRequestAccess(id);
  const request = await db.request.update({
    where: {
      id: id,
    },
    data: {
      name: value.name,
      method: value.method,
      url: value.url,
      body: value.body,
      headers: value.headers,
      parameters: value.parameters,
    },
  });

  return request;
};

export const getAllRequestFromCollection = async (collectionId: string) => {
  await requireCollectionAccess(collectionId);
  const requests = await db.request.findMany({
    where: {
      collectionId,
    },
  });
  return requests;
};

export async function sendRequest(req: SendInput) {
  await requireUser();
  return performRequest(req);
}

export async function run(requestId: string) {
  const { request } = await requireRequestAccess(requestId);

  const result = await performRequest({
    method: request.method,
    url: request.url,
    headers: request.headers,
    params: request.parameters,
    body: request.body,
  });

  const bodyText = result.error
    ? result.error
    : result.data === undefined || result.data === null || result.data === ""
      ? null
      : typeof result.data === "string"
        ? result.data
        : JSON.stringify(result.data);

  try {
    const requestRun = await db.requestRun.create({
      data: {
        requestId: request.id,
        status: result.status ?? 0,
        statusText: result.statusText || (result.error ? "Error" : null),
        headers: (result.headers ?? {}) as object,
        body: bodyText,
        durationMs: result.duration || 0,
      },
    });

    if (result.data && !result.error) {
      await db.request.update({
        where: { id: request.id },
        data: {
          response: result.data,
          updatedAt: new Date(),
        },
      });
    }

    return {
      success: !result.error,
      error: result.error,
      requestRun,
      result,
    };
  } catch (dbError) {
    return {
      success: false,
      error: `Request finished but saving the run failed: ${(dbError as Error).message}`,
      result,
    };
  }
}
