import ProductCollection from '../models/ProductCollection.js'
import Category from '../models/Category.js'
import { ApiError } from '../utils/ApiError.js'
import { parseOrThrow } from '../utils/validate.js'
import { assertObjectId } from '../utils/objectId.js'
import { deleteImage } from '../services/imageService.js'
import { collectionSchema, collectionUpdateSchema } from '../validators/catalogueValidator.js'

// GET /api/admin/collections (inactive bhi dikhte hain)
export async function listCollections(req, res) {
  const collections = await ProductCollection.find()
    .sort({ displayOrder: 1, name: 1 })
    .select('-__v')
    .lean()

  const counts = await Category.aggregate([{ $group: { _id: '$collectionId', count: { $sum: 1 } } }])
  const countById = Object.fromEntries(counts.map((c) => [String(c._id), c.count]))

  res.json({
    success: true,
    data: collections.map((c) => ({ ...c, categoryCount: countById[String(c._id)] || 0 })),
  })
}

// GET /api/admin/collections/:id
export async function getCollection(req, res) {
  assertObjectId(req.params.id, 'Collection')
  const collection = await ProductCollection.findById(req.params.id).select('-__v').lean()
  if (!collection) throw new ApiError(404, 'Collection not found')
  res.json({ success: true, data: collection })
}

// POST /api/admin/collections
export async function createCollection(req, res) {
  const data = parseOrThrow(collectionSchema, req.body ?? {})
  if (!data.slug) delete data.slug

  const collection = await ProductCollection.create(data)
  res.status(201).json({ success: true, data: collection })
}

// PUT /api/admin/collections/:id (kuch fields bhej ke bhi update ho jata hai)
export async function updateCollection(req, res) {
  assertObjectId(req.params.id, 'Collection')
  const data = parseOrThrow(collectionUpdateSchema, req.body ?? {})
  if (data.slug === '') delete data.slug

  const collection = await ProductCollection.findById(req.params.id)
  if (!collection) throw new ApiError(404, 'Collection not found')

  const oldPublicId = collection.bannerImage?.publicId
  collection.set(data)
  await collection.save() // (save se validation aur unique slug check dono chalte hain)

  if (data.bannerImage && oldPublicId && oldPublicId !== collection.bannerImage?.publicId) {
    await deleteImage(oldPublicId)
  }

  res.json({ success: true, data: collection })
}

// DELETE /api/admin/collections/:id
export async function deleteCollection(req, res) {
  assertObjectId(req.params.id, 'Collection')
  const collection = await ProductCollection.findById(req.params.id)
  if (!collection) throw new ApiError(404, 'Collection not found')

  const categoryCount = await Category.countDocuments({ collectionId: collection._id })
  if (categoryCount > 0) {
    throw new ApiError(
      409,
      'This collection still has categories. Delete or move them first, or deactivate the collection instead.',
    )
  }

  await collection.deleteOne()
  await deleteImage(collection.bannerImage?.publicId)
  res.json({ success: true, message: 'Collection deleted' })
}