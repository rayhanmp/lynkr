import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name is too long'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255)
    .transform(val => val.trim().toLowerCase()),
  password: z.string().min(8, 'Password is too short').max(64, 'Password is too long'),
})

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(val => val.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required'),
})

export const emailSchema = z.object({
  email: z.string().email().max(255).transform(val => val.trim().toLowerCase())
})

export const createLinkSchema = z.object({
  url: z.string()
    .transform((val) => {
      // Frontend pattern: auto-add https:// for better UX
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        return `https://${val}`;
      }
      return val;
    })
    .pipe(z.string().url("Please enter a valid URL")),
  customSlug: z.string()
    .min(1)
    .regex(/^[a-zA-Z0-9_-]+$/)  
    .max(64)
    .optional(),
  userId: z.string().uuid().optional(),  
  passwordProtected: z.boolean().default(false),  
  password: z.string().min(1).optional(),  
  comments: z.string().optional(),  
  isOneTime: z.boolean().default(false),  
}).refine((data) => {
  if (data.passwordProtected && !data.password) {
    return false;
  }
  return true;
}, {
  message: "Password is required when passwordProtected is true",
  path: ["password"],
})

export type RegisterData = z.infer<typeof registerSchema>
export type LoginData = z.infer<typeof loginSchema>
export type EmailData = z.infer<typeof emailSchema>
export type CreateLinkData = z.infer<typeof createLinkSchema> 