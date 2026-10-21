import { z } from 'zod'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// (Slug khaali bheja toh naam se apne aap ban jayega.)
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(100)
  .refine((v) => v === '' || slugPattern.test(v), 'Slug can only have lowercase letters, numbers and hyphens.')

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === '' || v.startsWith('https://'), 'Image URL must start with https://')

const singleImage = z.object({
  url: httpsUrl.default(''),
  publicId: z.string().trim().max(200).default(''),
})

// ---- Collection ----
export const collectionSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(80, 'Name is too long.'),
  slug: slug.optional(),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  bannerImage: singleImage.optional(),
  displayOrder: z.number().int().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
})
export const collectionUpdateSchema = collectionSchema.partial()

// ---- Category ----
export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(80, 'Name is too long.'),
  slug: slug.optional(),
  collectionId: objectId,
  description: z.string().trim().max(500).optional(),
  image: singleImage.optional(),
  displayOrder: z.number().int().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
})
export const categoryUpdateSchema = categorySchema.partial()

// ---- Product ----
const productImage = z.object({
  url: z.string().trim().max(500).refine((v) => v.startsWith('https://'), 'Image URL must start with https://'),
  publicId: z.string().trim().max(200).default(''),
  alt: z.string().trim().max(150).default(''),
})

const dimension = z.number().min(0).max(100000).nullable().optional()

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(120, 'Name is too long.'),
  slug: slug.optional(),
  categoryId: objectId,
  shortDescription: z.string().trim().max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  images: z.array(productImage).max(10, 'You can add at most 10 images.').optional(),
  dimensions: z
    .object({
      width: dimension,
      depth: dimension,
      height: dimension,
      unit: z.enum(['in', 'cm', 'mm']).optional(),
    })
    .optional(),
  materials: z.string().trim().max(300).optional(),
  colours: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  specifications: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(60),
        value: z.string().trim().min(1).max(150),
      }),
    )
    .max(20)
    .optional(),
  customizable: z.boolean().optional(),
  priceLabel: z.string().trim().max(60).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(10000).optional(),
})
export const productUpdateSchema = productSchema.partial()