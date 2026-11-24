import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().max(320),
  password: z.string().min(1).max(200),
});

export const createUserSchema = z.object({
  email: z.email().max(320),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(200),
});

export const changeEmailSchema = z.object({
  email: z.email().max(320),
  currentPassword: z.string().min(1).max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  password: z.string().min(8).max(200),
  confirmPassword: z.string().min(1).max(200),
});

export const titleSchema = z.string().trim().min(1).max(200);

export const listQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  sort: z.enum(["updated", "created", "title"]).default("updated"),
  favorite: z.boolean().default(false),
  trash: z.boolean().default(false),
  page: z.number().int().min(1).default(1),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export function parseListSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  trashDefault = false,
): ListQuery {
  const read = (key: string) => {
    if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const sort = read("sort");
  const page = Number(read("page") ?? "1");

  return listQuerySchema.parse({
    q: read("q") || undefined,
    sort: sort === "created" || sort === "title" ? sort : "updated",
    favorite: read("favorite") === "1",
    trash: trashDefault || read("trash") === "1",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  });
}
