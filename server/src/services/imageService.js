import { getCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'
import { ApiError } from '../utils/ApiError.js'

export const IMAGE_FOLDER = 'ayat-furniture'

// (URL mein f_auto,q_auto jodta hai: visitor ke phone ke hisaab se chhoti aur tez image milti hai.)
export function optimizeUrl(url) {
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}

export function uploadBuffer(buffer, folder = `${IMAGE_FOLDER}/products`) {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, 'Image upload is not configured on the server')
  }
  const cloudinary = getCloudinary()

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // (Cloudinary asli file ka format khud check karta hai)
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    )
    stream.end(buffer)
  })
}

// (Delete fail ho toh kaam nahi rukta, sirf warning log hoti hai.)
export async function deleteImage(publicId) {
  if (!publicId || !isCloudinaryConfigured()) return
  try {
    await getCloudinary().uploader.destroy(publicId)
  } catch (err) {
    console.warn(`Could not delete image ${publicId}:`, err.message)
  }
}