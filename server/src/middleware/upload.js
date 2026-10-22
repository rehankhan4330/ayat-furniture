import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'
import { MAX_IMAGE_BYTES } from '../config/limits.js'

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

// (File memory mein rehti hai aur seedha Cloudinary ko jati hai, server ki disk par kuch save nahi hota.)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 8 }, // (ek baar mein 8 images tak)
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Only JPG, PNG or WebP images are allowed'))
    }
    cb(null, true)
  },
})