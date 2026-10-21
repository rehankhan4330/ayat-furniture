import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
)

// (Login ke time: Admin.findOne({ email }).select('+passwordHash'))
adminSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash)
}

adminSchema.statics.comparePasswordWithHash = function (plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash)
}

adminSchema.statics.hashPassword = function (plainPassword) {
  return bcrypt.hash(plainPassword, 12)
}

export default mongoose.model('Admin', adminSchema)