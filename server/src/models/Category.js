import mongoose from 'mongoose'
import { slugify } from '../utils/slugify.js'

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' },
  },
  { _id: false },
)

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, maxlength: 80 },
    slug: { type: String, required: true, trim: true, lowercase: true },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCollection',
      required: [true, 'Collection is required'],
    },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    image: { type: imageSchema, default: () => ({}) },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

categorySchema.pre('validate', function () {
  if (!this.slug && this.name) this.slug = slugify(this.name)
})

// (Ek collection mein same slug dobara nahi. Ye index collection ke andar category dhundhne mein bhi kaam aata hai.)
categorySchema.index({ collectionId: 1, slug: 1 }, { unique: true })

export default mongoose.model('Category', categorySchema)