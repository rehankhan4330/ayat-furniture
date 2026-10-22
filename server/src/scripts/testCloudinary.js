import 'dotenv/config'
import fs from 'node:fs'
import { getCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'

function describe(err) {
  return err?.error?.message || err?.message || JSON.stringify(err)
}

// (Ek chhoti 1x1 pixel ki image, sirf connection test karne ke liye.)
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function uploadAndClean(cloudinary, source, label, sizeMb) {
  const t = Date.now()
  try {
    const result = await cloudinary.uploader.upload(source, {
      folder: 'ayat-furniture/test',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      timeout: 180000,
    })
    const secs = (Date.now() - t) / 1000
    const speed = sizeMb ? ` (about ${((sizeMb * 8) / secs).toFixed(2)} Mbps upload)` : ''
    console.log(`PASS  ${label} worked in ${secs.toFixed(1)}s${speed}`)
    await cloudinary.uploader.destroy(result.public_id)
  } catch (err) {
    console.log(`FAIL  ${label} failed after ${((Date.now() - t) / 1000).toFixed(1)}s ->`, describe(err))
  }
}

async function main() {
  const name = process.env.CLOUDINARY_CLOUD_NAME || ''
  const key = process.env.CLOUDINARY_API_KEY || ''
  const secret = process.env.CLOUDINARY_API_SECRET || ''

  console.log('Cloud name :', name || '(missing)')
  console.log('API key    :', key ? `${key.length} characters` : '(missing)')
  console.log('API secret :', secret ? `${secret.length} characters` : '(missing)')

  if (!isCloudinaryConfigured()) {
    console.log('\nOne or more Cloudinary values are missing in server/.env')
    return
  }

  const cloudinary = getCloudinary()

  const t0 = Date.now()
  try {
    const res = await cloudinary.api.ping()
    console.log(`\nPASS  Credentials are valid (ping ${res.status}, ${((Date.now() - t0) / 1000).toFixed(1)}s)`)
  } catch (err) {
    console.log('\nFAIL  Credentials rejected ->', describe(err))
    return
  }

  // 1. Chhota upload (hamesha chalta hai)
  await uploadAndClean(cloudinary, TINY_PNG, 'Tiny upload (1 pixel)', 0)

  // 2. Asli photo (photo ka path argument mein do)
  const file = process.argv[2]
  if (!file) {
    console.log('\nTip: to test a real photo, run:')
    console.log('     node src/scripts/testCloudinary.js "C:\\path\\to\\photo.jpg"')
    return
  }
  if (!fs.existsSync(file)) {
    console.log('File not found:', file)
    return
  }

  const sizeMb = fs.statSync(file).size / (1024 * 1024)
  console.log(`\nUploading your photo (${sizeMb.toFixed(2)} MB) ...`)
  await uploadAndClean(cloudinary, file, 'Your photo', sizeMb)
}

main().catch((err) => console.error('Script error:', err.message))