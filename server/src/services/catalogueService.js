import ProductCollection from '../models/ProductCollection.js'
import Category from '../models/Category.js'

export async function getActiveCategoryIds({ collection, category } = {}) {
  const collectionFilter = { isActive: true }
  if (collection) collectionFilter.slug = collection
  const collections = await ProductCollection.find(collectionFilter).select('_id').lean()

  const categoryFilter = {
    isActive: true,
    collectionId: { $in: collections.map((c) => c._id) },
  }
  if (category) categoryFilter.slug = category
  const categories = await Category.find(categoryFilter).select('_id').lean()

  return categories.map((c) => c._id)
}