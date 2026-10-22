import 'dotenv/config'
import crypto from 'node:crypto'

const cloud = process.env.CLOUDINARY_CLOUD_NAME
const key = process.env.CLOUDINARY_API_KEY
const secret = process.env.CLOUDINARY_API_SECRET

// (Ek chhoti 1x1 pixel ki image. Sirf connection aur permission test karne ke liye.)
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function attempt(label, extra) {
  const timestamp = Math.floor(Date.now() / 1000)
  const params = { timestamp, ...extra }

  // (Cloudinary ka signature: params ko A-Z order mein jodke, secret lagake SHA-1.)
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  const signature = crypto.createHash('sha1').update(toSign + secret).digest('hex')

  const form = new FormData()
  form.append('file', TINY_PNG)
  form.append('api_key', key)
  form.append('signature', signature)
  for (const [k, v] of Object.entries(params)) form.append(k, String(v))

  console.log(`\n--- ${label} ---`)
  const started = Date.now()
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: 'POST',
      body: form,
    })
    const body = await res.text()
    console.log('Status      :', res.status, `(${((Date.now() - started) / 1000).toFixed(1)}s)`)
    console.log('Content-Type:', res.headers.get('content-type'))
    console.log('Server      :', res.headers.get('server') || '(none)')
    console.log('X-Request-Id:', res.headers.get('x-request-id') || '(none)')
    console.log('Body (first 400 chars):')
    console.log(body.slice(0, 400))

    // (Upload ho gayi toh turant hata do.)
    try {
      const json = JSON.parse(body)
      if (json.public_id) {
        const ts = Math.floor(Date.now() / 1000)
        const sig = crypto
          .createHash('sha1')
          .update(`public_id=${json.public_id}&timestamp=${ts}${secret}`)
          .digest('hex')
        const del = new FormData()
        del.append('public_id', json.public_id)
        del.append('timestamp', String(ts))
        del.append('api_key', key)
        del.append('signature', sig)
        await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: 'POST', body: del })
        console.log('(test image removed)')
      }
    } catch {
      // body JSON nahi tha, koi baat nahi
    }
  } catch (err) {
    console.log('Request failed:', err.message, err.cause?.code ? `(${err.cause.code})` : '')
  }
}

async function main() {
  if (!cloud || !key || !secret) {
    console.log('Cloudinary values are missing in server/.env')
    return
  }
  console.log('Cloud name:', cloud)

  await attempt('1. Upload without folder', {})
  await attempt('2. Upload into folder', { folder: 'ayat-furniture/test' })
}

main()