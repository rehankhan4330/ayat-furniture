import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 80 },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
      default: '',
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    message: { type: String, required: [true, 'Message is required'], trim: true, minlength: 10, maxlength: 1000 },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    type: { type: String, enum: ['callback', 'contact'], default: 'callback' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
    sourcePath: { type: String, trim: true, maxlength: 300, default: '' },
    utm: {
      source: { type: String, trim: true, maxlength: 100, default: '' },
      medium: { type: String, trim: true, maxlength: 100, default: '' },
      campaign: { type: String, trim: true, maxlength: 150, default: '' },
    },
  },
  { timestamps: true },
)

// (Admin leads list: status filter + naya pehle.)
leadSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('Lead', leadSchema)