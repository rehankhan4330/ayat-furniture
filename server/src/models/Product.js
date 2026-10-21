import mongoose from 'mongoose'
import { slugify } from '../utils/slugify.js'

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true, default: '' },
    alt: { type: String, trim: true, maxlength: 150, default: '' },
  },
  { _id: false },
)

const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    value: { type: String, required: true, trim: true, maxlength: 150 },
  },
  { _id: false },
)

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true }, // (poori site mein unique)
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    shortDescription: { type: String, trim: true, maxlength: 200, default: '' },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    images: { type: [productImageSchema], default: [] }, // (pehli image main image hai)
    dimensions: {
      width: { type: Number, min: 0 },
      depth: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, enum: ['in', 'cm', 'mm'], default: 'in' },
    },
    materials: { type: String, trim: true, maxlength: 300, default: '' },
    colours: { type: [String], default: [] },
    specifications: { type: [specSchema], default: [] },
    customizable: { type: Boolean, default: false }, // (custom size/fabric mil sakta hai)
    priceLabel: { type: String, trim: true, maxlength: 60, default: '' }, // (khaali = "Price on enquiry")
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // ("Delete" = isActive false, taaki purane links na tootein)
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
)

productSchema.pre('validate', function () {
  if (!this.slug && this.name) this.slug = slugify(this.name)
})

// (Category page: ek category ke active products, order ke hisaab se.)
productSchema.index({ categoryId: 1, isActive: 1, displayOrder: 1 })
// (Home page: featured products.)
productSchema.index({ featured: 1, isActive: 1 })

export default mongoose.model('Product', productSchema)