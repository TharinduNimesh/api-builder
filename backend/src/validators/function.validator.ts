import { z } from 'zod';

export const createFunctionSchema = z.object({
  sql: z.string().min(1, 'SQL is required'),
});

export type CreateFunctionInput = z.infer<typeof createFunctionSchema>;
