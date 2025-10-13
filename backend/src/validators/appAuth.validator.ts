import { z } from 'zod';

export const signupSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signinSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export type AppSignupInput = z.infer<typeof signupSchema>;
export type AppSigninInput = z.infer<typeof signinSchema>;
