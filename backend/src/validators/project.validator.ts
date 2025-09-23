import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  enable_roles: z.boolean().optional(),
  roles: z.array(z.object({ name: z.string().min(1), description: z.string().optional() })).optional(),
  is_protected: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
