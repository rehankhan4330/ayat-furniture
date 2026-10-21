import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

// (File memory mein rehti hai aur seedha Cloudinary ko jati hai, server ki disk par kuch save nahi hota.)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 }, // (5 MB har image, ek baar mein 8 tak)
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Only JPG, PNG or WebP images are allowed'))
    }
    cb(null, true)
  },
})