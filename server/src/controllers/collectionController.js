import ProductCollection from '../models/ProductCollection.js'
import Category from '../models/Category.js'
import { ApiError } from '../utils/ApiError.js'

// GET /api/collections
export async function getCollections(req, res) {
  const collections = await ProductCollection.find({ isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .select('-__v')
    .lean()

  const counts = await Category.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$collectionId', count: { $sum: 1 } } },
  ])
  const countById = Object.fromEntries(counts.map((c) => [String(c._id), c.count]))

  const data = collections.map((c) => ({
    ...c,
    categoryCount: countById[String(c._id)] || 0,
  }))

  res.json({ success: true, data })
}

// GET /api/collections/:slug
export async function getCollectionBySlug(req, res) {
  const collection = await ProductCollection.findOne({
    slug: req.params.slug.toLowerCase(),
    isActive: true,
  })
    .select('-__v')
    .lean()

  if (!collection) throw new ApiError(404, 'Collection not found')

  const categories = await Category.find({ collectionId: collection._id, isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .select('-__v')
    .lean()

  res.json({ success: true, data: { ...collection, categories } })
}