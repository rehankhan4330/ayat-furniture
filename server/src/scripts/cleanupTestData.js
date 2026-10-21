import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import ProductCollection from '../models/ProductCollection.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'

// (Sirf wahi records hataata hai jinka slug "zz-test" se shuru hota hai, yaani test ka data.)
async function main() {
  await connectDB()

  const testCollections = await ProductCollection.find({ slug: /^zz-test/ }).select('_id')
  const collectionIds = testCollections.map((c) => c._id)

  const testCategories = await Category.find({
    $or: [{ slug: /^zz-test/ }, { collectionId: { $in: collectionIds } }],
  }).select('_id')
  const categoryIds = testCategories.map((c) => c._id)

  const products = await Product.deleteMany({
    $or: [{ slug: /^zz-test/ }, { categoryId: { $in: categoryIds } }],
  })
  const categories = await Category.deleteMany({ _id: { $in: categoryIds } })
  const collections = await ProductCollection.deleteMany({ _id: { $in: collectionIds } })

  console.log(
    `Removed: ${collections.deletedCount} collections, ${categories.deletedCount} categories, ${products.deletedCount} products.`,
  )
}

main()
  .catch((err) => {
    console.error('Cleanup failed:', err.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())