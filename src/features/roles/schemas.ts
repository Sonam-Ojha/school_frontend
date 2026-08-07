import { z } from 'zod';

/**
 * Role validation. Transform-free so the inferred type matches the form's
 * field values; normalisation happens in the service.
 */
export const roleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(60, 'Role name must be at most 60 characters')
    // Spatie stores the name verbatim and it appears in URLs and policies,
    // so keep it to a predictable slug.
    .regex(
      /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers and single hyphens (e.g. "school-admin")',
    ),
  // No `.default()`: it would make the inferred input type optional and
  // desync the schema from what the form field actually holds.
  permissions: z.array(z.string()),
});

export type RoleInput = z.infer<typeof roleSchema>;
