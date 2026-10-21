import 'dotenv/config'
import fs from 'node:fs'
import { getCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'

function describe(err) {
  return err?.error?.message || err?.message || JSON.stringify(err)
}

async function main() {
  const name = process.env.CLOUDINARY_CLOUD_NAME || ''
  const key = process.env.CLOUDINARY_API_KEY || ''
  const secret = process.env.CLOUDINARY_API_SECRET || ''

  console.log('Cloud name :', name || '(missing)')
  console.log('API key    :', key ? `${key.length} characters` : '(missing)')
  console.log('API secret :', secret ? `${secret.length} characters` : '(missing)')

  const bad = [name, key, secret].some((v) => /\s/.test(v) || /["']/.test(v))
  console.log('Spaces/quotes in values:', bad ? 'YES (remove them)' : 'no')

  if (!isCloudinaryConfigured()) {
    console.log('\nOne or more Cloudinary values are missing in server/.env')
    return
  }

  const cloudinary = getCloudinary()

  // 1. Keys sahi hain ya nahi
  try {
    const res = await cloudinary.api.ping()
    console.log('\nPASS  Credentials are valid (ping status:', res.status + ')')
  } catch (err) {
    console.log('\nFAIL  Credentials rejected ->', describe(err))
    return
  }

  // 2. Asli image upload (photo ka path argument mein do)
  const file = process.argv[2]
  if (!file) {
    console.log('Tip: run with an image path to test a real upload:')
    console.log('     node src/scripts/testCloudinary.js "C:\\path\\to\\photo.jpg"')
    return
  }
  if (!fs.existsSync(file)) {
    console.log('File not found:', file)
    return
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'ayat-furniture/test',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    })
    console.log('PASS  Upload worked ->', result.secure_url)
    await cloudinary.uploader.destroy(result.public_id)
    console.log('PASS  Test image deleted again')
  } catch (err) {
    console.log('FAIL  Upload failed ->', describe(err))
  }
}

main().catch((err) => console.error('Script error:', err.message))