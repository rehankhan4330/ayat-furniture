import { z } from 'zod'
import ProductCollection from '../models/ProductCollection.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { parseOrThrow } from '../utils/validate.js'
import { assertObjectId } from '../utils/objectId.js'
import { deleteImage } from '../services/imageService.js'
import { categorySchema, categoryUpdateSchema, objectId } from '../validators/catalogueValidator.js'

const listQuerySchema = z.object({ collectionId: objectId.optional() })

async function ensureCollection(collectionId) {
  const exists = await ProductCollection.exists({ _id: collectionId })
  if (!exists) {
    throw new ApiError(400, 'Selected collection does not exist', {
      collectionId: 'Selected collection does not exist.',
    })
  }
}

// GET /api/admin/categories?collectionId=
export async function listCategories(req, res) {
  const { collectionId } = parseOrThrow(listQuerySchema, req.query)
  const filter = collectionId ? { collectionId } : {}

  const categories = await Category.find(filter)
    .sort({ displayOrder: 1, name: 1 })
    .populate('collectionId', 'name slug')
    .select('-__v')
    .lean()

  const counts = await Product.aggregate([{ $group: { _id: '$categoryId', count: { $sum: 1 } } }])
  const countById = Object.fromEntries(counts.map((c) => [String(c._id), c.count]))

  const data = categories.map(({ collectionId: col, ...rest }) => ({
    ...rest,
    collectionId: col?._id ?? null,
    collection: col ? { _id: col._id, name: col.name, slug: col.slug } : null,
    productCount: countById[String(rest._id)] || 0,
  }))

  res.json({ success: true, data })
}

// GET /api/admin/categories/:id
export async function getCategory(req, res) {
  assertObjectId(req.params.id, 'Category')
  const category = await Category.findById(req.params.id).select('-__v').lean()
  if (!category) throw new ApiError(404, 'Category not found')
  res.json({ success: true, data: category })
}

// POST /api/admin/categories
export async function createCategory(req, res) {
  const data = parseOrThrow(categorySchema, req.body ?? {})
  if (!data.slug) delete data.slug

  await ensureCollection(data.collectionId)
  const category = await Category.create(data)
  res.status(201).json({ success: true, data: category })
}

// PUT /api/admin/categories/:id
export async function updateCategory(req, res) {
  assertObjectId(req.params.id, 'Category')
  const data = parseOrThrow(categoryUpdateSchema, req.body ?? {})
  if (data.slug === '') delete data.slug

  const category = await Category.findById(req.params.id)
  if (!category) throw new ApiError(404, 'Category not found')

  if (data.collectionId) await ensureCollection(data.collectionId)

  const oldPublicId = category.image?.publicId
  category.set(data)
  await category.save()

  if (data.image && oldPublicId && oldPublicId !== category.image?.publicId) {
    await deleteImage(oldPublicId)
  }

  res.json({ success: true, data: category })
}

// DELETE /api/admin/categories/:id
export async function deleteCategory(req, res) {
  assertObjectId(req.params.id, 'Category')
  const category = await Category.findById(req.params.id)
  if (!category) throw new ApiError(404, 'Category not found')

  const productCount = await Product.countDocuments({ categoryId: category._id })
  if (productCount > 0) {
    throw new ApiError(
      409,
      'This category still has products. Move or delete them first, or deactivate the category instead.',
    )
  }

  await category.deleteOne()
  await deleteImage(category.image?.publicId)
  res.json({ success: true, message: 'Category deleted' })
}