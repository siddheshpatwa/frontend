// Client-safe REST method constants — mirrors the Prisma REST_METHOD enum
// but does NOT import from the generated Prisma client (which uses Node.js internals)
export const REST_METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

export type REST_METHOD = (typeof REST_METHOD)[keyof typeof REST_METHOD];
