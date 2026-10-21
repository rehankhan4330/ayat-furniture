import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import ProductCollection from '../models/ProductCollection.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'

const collectionsData = [
  { slug: 'living-room', name: 'Living Room', tagline: 'Sofas, chairs and tables for your living space.' },
  { slug: 'bedroom', name: 'Bedroom', tagline: 'Beds, wardrobes and bedside storage.' },
  { slug: 'dining', name: 'Dining', tagline: 'Dining tables and chairs for family meals.' },
  { slug: 'office', name: 'Office & Others', tagline: 'Office chairs, desks and custom furniture.' },
]

// [slug, name, collectionSlug, description]
const categoriesData = [
  ['stationary-sofas', 'Stationary Sofas', 'living-room', 'Classic sofas in many sizes and fabrics.'],
  ['recliner-sofas', 'Recliner Sofas', 'living-room', 'Motion sofas for relaxed seating.'],
  ['l-shape-sofas', 'L-Shape Sofas', 'living-room', 'Sectional sofas for larger rooms.'],
  ['armchairs', 'Armchairs', 'living-room', 'Accent chairs and armchairs.'],
  ['center-tables', 'Center Tables', 'living-room', 'Center tables to match your sofa.'],
  ['beds', 'Beds', 'bedroom', 'Comfortable beds in many designs.'],
  ['bedside-tables', 'Bedside Tables', 'bedroom', 'Bedside tables with drawers.'],
  ['wardrobes', 'Wardrobes', 'bedroom', 'Spacious wardrobes made to fit.'],
  ['dining-tables', 'Dining Tables', 'dining', 'Dining tables for every family size.'],
  ['dining-chairs', 'Dining Chairs', 'dining', 'Comfortable dining chairs.'],
  ['office-chairs', 'Office Chairs', 'office', 'Ergonomic chairs for work.'],
  ['work-desks', 'Work Desks', 'office', 'Work desks for home and office.'],
]

// [slug, name, categorySlug, shortDescription, [w, d, h], customizable, featured, extra spec]
const productsData = [
  ['sample-sofa-1', 'Sample Sofa 1', 'stationary-sofas', 'A comfortable three-seater sofa.', [84, 36, 34], true, true, ['Seating', '3 seater']],
  ['sample-sofa-2', 'Sample Sofa 2', 'stationary-sofas', 'A compact two-seater sofa.', [64, 34, 33], true, false, ['Seating', '2 seater']],
  ['sample-recliner', 'Sample Recliner', 'recliner-sofas', 'A motion sofa with smooth recline.', [90, 38, 40], false, true, ['Mechanism', 'Manual recliner']],
  ['sample-l-shape-sofa', 'Sample L-Shape Sofa', 'l-shape-sofas', 'A spacious sectional sofa.', [108, 70, 34], true, true, ['Layout', 'L-shape']],
  ['sample-armchair', 'Sample Armchair', 'armchairs', 'A stylish accent armchair.', [30, 32, 34], false, false, ['Seating', '1 seater']],
  ['sample-bed', 'Sample Bed', 'beds', 'A sturdy bed with storage.', [66, 84, 40], true, true, ['Size', 'Queen']],
  ['sample-dining-table', 'Sample Dining Table', 'dining-tables', 'A six-seater dining table.', [72, 36, 30], true, false, ['Seating', '6 seater']],
  ['sample-office-chair', 'Sample Office Chair', 'office-chairs', 'An ergonomic office chair.', [26, 26, 44], false, false, ['Back', 'Mesh']],
]

async function seed() {
  const reset = process.argv.includes('--reset')

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding is blocked in production.')
  }

  await connectDB()

  const existing = await ProductCollection.countDocuments()
  if (existing > 0 && !reset) {
    console.log('Database already has data. Seed skipped.')
    console.log('To wipe collections, categories and products and re-seed, run with --reset')
    return
  }

  if (reset) {
    await Product.deleteMany({})
    await Category.deleteMany({})
    await ProductCollection.deleteMany({})
    console.log('Old catalogue data removed.')
  }

  const collections = await ProductCollection.create(
    collectionsData.map((c, i) => ({ ...c, displayOrder: i })),
  )
  const collectionIdBySlug = Object.fromEntries(collections.map((c) => [c.slug, c._id]))

  const categories = await Category.create(
    categoriesData.map(([slug, name, collectionSlug, description], i) => ({
      slug,
      name,
      description,
      collectionId: collectionIdBySlug[collectionSlug],
      displayOrder: i,
    })),
  )
  const categoryIdBySlug = Object.fromEntries(categories.map((c) => [c.slug, c._id]))

  const products = await Product.create(
    productsData.map(([slug, name, categorySlug, shortDescription, size, customizable, featured, spec], i) => ({
      slug,
      name,
      shortDescription,
      description: 'This is a demo description. The real product description will be added from the admin panel.',
      categoryId: categoryIdBySlug[categorySlug],
      dimensions: { width: size[0], depth: size[1], height: size[2], unit: 'in' },
      materials: 'Solid wood frame, high-density foam, fabric upholstery',
      colours: ['Beige', 'Grey', 'Green'],
      specifications: [{ label: spec[0], value: spec[1] }],
      customizable,
      featured,
      displayOrder: i,
    })),
  )

  console.log(
    `Seeded: ${collections.length} collections, ${categories.length} categories, ${products.length} products (SAMPLE DATA).`,
  )
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())