import { z } from 'zod'
import Product from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { parseOrThrow } from '../utils/validate.js'
import { getActiveCategoryIds } from '../services/catalogueService.js'

const slugPattern = /^[a-z0-9-]+$/

const listQuerySchema = z.object({
  collection: z.string().regex(slugPattern, 'Invalid collection').optional(),
  category: z.string().regex(slugPattern, 'Invalid category').optional(),
  featured: z.enum(['true', 'false']).optional(),
  sort: z.enum(['newest', 'name-asc', 'name-desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})

const sortMap = {
  newest: { createdAt: -1 },
  'name-asc': { name: 1 },
  'name-desc': { name: -1 },
}

// (Product ke saath category aur collection ka naam/slug bhi chahiye, link banane ke liye.)
const populateCategory = {
  path: 'categoryId',
  select: 'name slug isActive collectionId',
  populate: { path: 'collectionId', select: 'name slug isActive' },
}

function serializeProduct(p) {
  const { categoryId, __v, ...rest } = p
  const col = categoryId?.collectionId
  return {
    ...rest,
    category: categoryId
      ? { _id: categoryId._id, name: categoryId.name, slug: categoryId.slug }
      : null,
    collection: col ? { _id: col._id, name: col.name, slug: col.slug } : null,
  }
}

// GET /api/products?collection=&category=&featured=&sort=&page=&limit=
export async function getProducts(req, res) {
  const { collection, category, featured, sort, page, limit } = parseOrThrow(
    listQuerySchema,
    req.query,
  )

  const categoryIds = await getActiveCategoryIds({ collection, category })

  const filter = { isActive: true, categoryId: { $in: categoryIds } }
  if (featured) filter.featured = featured === 'true'

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort])
      .collation({ locale: 'en' })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(populateCategory)
      .lean(),
    Product.countDocuments(filter),
  ])

  res.json({
    success: true,
    data: products.map(serializeProduct),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  })
}

// GET /api/products/:slug
export async function getProductBySlug(req, res) {
  const slug = req.params.slug.toLowerCase()
  if (!slugPattern.test(slug)) throw new ApiError(404, 'Product not found')

  const product = await Product.findOne({ slug, isActive: true })
    .populate(populateCategory)
    .lean()

  const category = product?.categoryId
  const collection = category?.collectionId

  // (Product, category ya collection mein se koi inactive ho toh product nahi dikhega.)
  if (!product || !category?.isActive || !collection?.isActive) {
    throw new ApiError(404, 'Product not found')
  }

  // Related: same collection ke products, same category wale pehle
  const siblingCategoryIds = await getActiveCategoryIds({ collection: collection.slug })
  const others = await Product.find({
    isActive: true,
    _id: { $ne: product._id },
    categoryId: { $in: siblingCategoryIds },
  })
    .limit(12)
    .populate(populateCategory)
    .lean()

  const sameCategory = (p) => String(p.categoryId._id) === String(category._id)
  const related = others
    .sort((a, b) => Number(sameCategory(b)) - Number(sameCategory(a)))
    .slice(0, 4)
    .map(serializeProduct)

  res.json({ success: true, data: { ...serializeProduct(product), related } })
}