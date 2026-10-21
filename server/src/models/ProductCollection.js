import mongoose from 'mongoose'
import { slugify } from '../utils/slugify.js'

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' }, // (Cloudinary ID, image delete karne ke kaam aayega)
  },
  { _id: false },
)

const productCollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Collection name is required'], trim: true, maxlength: 80 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    tagline: { type: String, trim: true, maxlength: 200, default: '' },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    bannerImage: { type: imageSchema, default: () => ({}) },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

// (Slug nahi diya toh name se bana dega.)
productCollectionSchema.pre('validate', function () {
  if (!this.slug && this.name) this.slug = slugify(this.name)
})

export default mongoose.model('ProductCollection', productCollectionSchema)