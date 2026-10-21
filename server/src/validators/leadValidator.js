import { z } from 'zod'

// (+91, 91 ya 0 se shuru hone wale numbers bhi chalenge. Final: 10 digit, 6-9 se shuru.)
export function cleanPhone(phone) {
  let digits = String(phone).replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return digits
}

const optionalText = (max) => z.string().trim().max(max).optional()

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80, 'Name is too long.'),
  phone: z
    .string()
    .transform(cleanPhone)
    .refine((v) => /^[6-9]\d{9}$/.test(v), 'Please enter a valid 10-digit mobile number.'),
  email: z
    .string()
    .trim()
    .max(120, 'Email is too long.')
    .refine((v) => v === '' || /^\S+@\S+\.\S+$/.test(v), 'Please enter a valid email address.'),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters.')
    .max(1000, 'Message is too long.'),
  type: z.enum(['callback', 'contact']).default('callback'),
  productSlug: optionalText(120),
  sourcePath: optionalText(300),
  website: z.string().optional(), // (honeypot)
  utm: z
    .object({
      source: optionalText(100),
      medium: optionalText(100),
      campaign: optionalText(150),
    })
    .optional(),
})