import Lead from '../models/Lead.js'
import Product from '../models/Product.js'
import { parseOrThrow } from '../utils/validate.js'
import { leadSchema } from '../validators/leadValidator.js'
import { sendLeadNotification } from '../services/notificationService.js'

// POST /api/leads
export async function createLead(req, res) {
  const body = { name: '', phone: '', email: '', message: '', ...(req.body ?? {}) }

  // (Honeypot: insaan ko ye field dikhta nahi. Bot bhar de toh chupchap success bol do, save mat karo.)
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return res.status(201).json({ success: true, message: 'Thank you! We will contact you soon.' })
  }

  const data = parseOrThrow(leadSchema, body)

  let product = null
  if (data.productSlug) {
    product = await Product.findOne({ slug: data.productSlug.toLowerCase() })
      .select('_id name')
      .lean()
  }

  const lead = await Lead.create({
    name: data.name,
    phone: data.phone,
    email: data.email,
    message: data.message,
    type: data.type,
    productId: product?._id ?? null,
    sourcePath: data.sourcePath || '',
    utm: {
      source: data.utm?.source || '',
      medium: data.utm?.medium || '',
      campaign: data.utm?.campaign || '',
    },
  })

  // (Lead save ho chuki hai. Email fail ho toh bhi visitor ko success hi dikhega.)
  try {
    await sendLeadNotification(lead, product?.name)
  } catch (err) {
    console.error('Lead email failed (lead is saved):', err.message)
  }

  res.status(201).json({
    success: true,
    message: 'Thank you! We will contact you soon.',
    data: { id: lead._id },
  })
}