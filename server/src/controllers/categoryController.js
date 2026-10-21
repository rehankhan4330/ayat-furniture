import { z } from 'zod'
import ProductCollection from '../models/ProductCollection.js'
import Category from '../models/Category.js'
import { parseOrThrow } from '../utils/validate.js'

const querySchema = z.object({
  collection: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Invalid collection')
    .optional(),
})

// GET /api/categories?collection=living-room
export async function getCategories(req, res) {
  const { collection } = parseOrThrow(querySchema, req.query)

  const collectionFilter = { isActive: true }
  if (collection) collectionFilter.slug = collection
  const collections = await ProductCollection.find(collectionFilter).select('_id').lean()

  const categories = await Category.find({
    isActive: true,
    collectionId: { $in: collections.map((c) => c._id) },
  })
    .sort({ displayOrder: 1, name: 1 })
    .populate('collectionId', 'name slug')
    .select('-__v')
    .lean()

  const data = categories.map(({ collectionId, ...rest }) => ({
    ...rest,
    collection: collectionId
      ? { _id: collectionId._id, name: collectionId.name, slug: collectionId.slug }
      : null,
  }))

  res.json({ success: true, data })
}