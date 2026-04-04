import { z } from 'zod'

export const volunteerProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  status: z.enum(['new_member', 'member', 'inactive_member', 'board', 'alumni', 'parachute']).optional(),
  join_semester: z.string().max(20).optional().nullable(),
  birthdate: z.string().optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  contacts: z.record(z.string(), z.string()).optional(),
}).strict()

export const projectCreateSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z][a-z0-9_]*$/, 'Slug must start with a letter and contain only lowercase letters, numbers, and underscores'),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  app_url: z.string().url().optional().nullable(),
  access_level: z.enum(['public', 'staff_only', 'admin_only', 'custom']).optional().default('staff_only'),
  allow_signup: z.boolean().optional().default(false),
  allow_access_requests: z.boolean().optional().default(false),
  allow_admin_requests: z.boolean().optional().default(false),
})

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return { error: messages }
  }
  return { data: result.data }
}
