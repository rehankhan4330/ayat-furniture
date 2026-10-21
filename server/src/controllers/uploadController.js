import { z } from 'zod'
import { ApiError } from '../utils/ApiError.js'
import { parseOrThrow } from '../utils/validate.js'
import { IMAGE_FOLDER, optimizeUrl, uploadBuffer, deleteImage } from '../services/imageService.js'

// POST /api/admin/upload (form-data, field name: images, max 8 files)
export async function uploadImages(req, res) {
  const files = req.files ?? []
  if (files.length === 0) throw new ApiError(400, 'Please choose at least one image')

  const results = await Promise.allSettled(files.map((f) => uploadBuffer(f.buffer)))

  // (Ek bhi fail hua toh jo upload ho chuki thi unhe wapas hata do, adhoora kaam nahi chhodte.)
  const failed = results.find((r) => r.status === 'rejected')
  if (failed) {
    for (const r of results) {
      if (r.status === 'fulfilled') await deleteImage(r.value.public_id)
    }
    if (failed.reason instanceof ApiError) throw failed.reason
    console.error('Cloudinary upload failed:', failed.reason?.message || failed.reason)
    throw new ApiError(502, 'Image upload failed. Please try again.')
  }

  const data = results.map((r) => ({
    url: optimizeUrl(r.value.secure_url),
    publicId: r.value.public_id,
    width: r.value.width,
    height: r.value.height,
  }))

  res.status(201).json({ success: true, data })
}

const removeSchema = z.object({
  publicId: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .refine((v) => v.startsWith(`${IMAGE_FOLDER}/`), 'Invalid image id'),
})

// DELETE /api/admin/upload  body: { publicId }
export async function removeImage(req, res) {
  const { publicId } = parseOrThrow(removeSchema, req.body ?? {})
  await deleteImage(publicId)
  res.json({ success: true, message: 'Image removed' })
}