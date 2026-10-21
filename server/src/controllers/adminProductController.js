import { z } from 'zod'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import { ApiError } from '../utils/ApiError.js'
import { parseOrThrow } from '../utils/validate.js'
import { assertObjectId } from '../utils/objectId.js'
import { deleteImage } from '../services/imageService.js'
import { productSchema, productUpdateSchema, objectId } from '../validators/catalogueValidator.js'

const listQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  collection: objectId.optional(), // (collection ki id)
  category: objectId.optional(), // (category ki id)
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const populateCategory = {
  path: 'categoryId',
  select: 'name slug collectionId',
  populate: { path: 'collectionId', select: 'name slug' },
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function serialize(p) {
  const { categoryId, __v, ...rest } = p
  const col = categoryId?.collectionId
  return {
    ...rest,
    categoryId: categoryId?._id ?? null,
    category: categoryId ? { _id: categoryId._id, name: categoryId.name, slug: categoryId.slug } : null,
    collection: col ? { _id: col._id, name: col.name, slug: col.slug } : null,
  }
}

async function ensureCategory(categoryId) {
  const exists = await Category.exists({ _id: categoryId })
  if (!exists) {
    throw new ApiError(400, 'Selected category does not exist', {
      categoryId: 'Selected category does not exist.',
    })
  }
}

// GET /api/admin/products?search=&collection=&category=&status=&page=&limit=
export async function listProducts(req, res) {
  const { search, collection, category, status, page, limit } = parseOrThrow(listQuerySchema, req.query)

  const filter = {}
  if (status === 'active') filter.isActive = true
  if (status === 'inactive') filter.isActive = false
  if (search) filter.name = { $regex: escapeRegExp(search), $options: 'i' }

  if (category) {
    filter.categoryId = category
  } else if (collection) {
    const ids = await Category.find({ collectionId: collection }).distinct('_id')
    filter.categoryId = { $in: ids }
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(populateCategory)
      .lean(),
    Product.countDocuments(filter),
  ])

  res.json({
    success: true,
    data: products.map(serialize),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  })
}

// GET /api/admin/products/:id
export async function getProduct(req, res) {
  assertObjectId(req.params.id, 'Product')
  const product = await Product.findById(req.params.id).populate(populateCategory).lean()
  if (!product) throw new ApiError(404, 'Product not found')
  res.json({ success: true, data: serialize(product) })
}

// POST /api/admin/products
export async function createProduct(req, res) {
  const data = parseOrThrow(productSchema, req.body ?? {})
  if (!data.slug) delete data.slug

  await ensureCategory(data.categoryId)
  const product = await Product.create(data)
  res.status(201).json({ success: true, data: product })
}

// PUT /api/admin/products/:id (activate/deactivate ke liye sirf { isActive: false } bhejna kaafi hai)
export async function updateProduct(req, res) {
  assertObjectId(req.params.id, 'Product')
  const data = parseOrThrow(productUpdateSchema, req.body ?? {})
  if (data.slug === '') delete data.slug

  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, 'Product not found')

  if (data.categoryId) await ensureCategory(data.categoryId)

  const oldPublicIds = product.images.map((img) => img.publicId).filter(Boolean)
  product.set(data)
  await product.save()

  // (Jo images hata di gayi, unhe Cloudinary se bhi hata do.)
  if (data.images) {
    const keep = new Set(product.images.map((img) => img.publicId))
    for (const id of oldPublicIds) {
      if (!keep.has(id)) await deleteImage(id)
    }
  }

  res.json({ success: true, data: product })
}

// DELETE /api/admin/products/:id
// Default: sirf deactivate (purane links na tootein). Pakka delete: ?permanent=true
export async function deleteProduct(req, res) {
  assertObjectId(req.params.id, 'Product')
  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, 'Product not found')

  if (req.query.permanent === 'true') {
    const publicIds = product.images.map((img) => img.publicId).filter(Boolean)
    await product.deleteOne()
    for (const id of publicIds) await deleteImage(id)
    return res.json({ success: true, message: 'Product permanently deleted' })
  }

  product.isActive = false
  await product.save()
  res.json({
    success: true,
    message: 'Product deactivated. It is hidden from the website but its link and data are kept.',
    data: product,
  })
}