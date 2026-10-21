import { z } from 'zod'
import Lead from '../models/Lead.js'
import { ApiError } from '../utils/ApiError.js'
import { parseOrThrow } from '../utils/validate.js'
import { assertObjectId } from '../utils/objectId.js'

const listQuerySchema = z.object({
  status: z.enum(['all', 'new', 'contacted', 'closed']).default('all'),
  type: z.enum(['all', 'callback', 'contact']).default('all'),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const statusSchema = z.object({
  status: z.enum(['new', 'contacted', 'closed'], { message: 'Status must be new, contacted or closed.' }),
})

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildFilter({ status, type, search }) {
  const filter = {}
  if (status !== 'all') filter.status = status
  if (type !== 'all') filter.type = type
  if (search) {
    const rx = { $regex: escapeRegExp(search), $options: 'i' }
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }]
  }
  return filter
}

function serialize(l) {
  const { productId, __v, ...rest } = l
  return {
    ...rest,
    productId: productId?._id ?? null,
    product: productId ? { _id: productId._id, name: productId.name, slug: productId.slug } : null,
  }
}

// GET /api/admin/leads?status=&type=&search=&page=&limit=
export async function listLeads(req, res) {
  const query = parseOrThrow(listQuerySchema, req.query)
  const filter = buildFilter(query)

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate('productId', 'name slug')
      .lean(),
    Lead.countDocuments(filter),
  ])

  res.json({
    success: true,
    data: leads.map(serialize),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  })
}

// GET /api/admin/leads/stats (dashboard ke counts)
export async function getLeadStats(req, res) {
  const [byStatus, last7Days] = await Promise.all([
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
  ])

  const counts = { new: 0, contacted: 0, closed: 0 }
  for (const row of byStatus) counts[row._id] = row.count

  res.json({
    success: true,
    data: { total: counts.new + counts.contacted + counts.closed, ...counts, last7Days },
  })
}

// (Excel mein formula ban kar chal na jaye, isliye = + - @ se shuru hone wale text ke aage ' laga dete hain.)
function csvCell(value) {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

// GET /api/admin/leads/export (CSV download, wahi filters jo list mein hain)
export async function exportLeads(req, res) {
  const query = parseOrThrow(listQuerySchema, req.query)
  const leads = await Lead.find(buildFilter(query))
    .sort({ createdAt: -1 })
    .limit(5000)
    .populate('productId', 'name')
    .lean()

  const header = [
    'Date', 'Name', 'Phone', 'Email', 'Message', 'Type', 'Status',
    'Product', 'Page', 'UTM source', 'UTM medium', 'UTM campaign',
  ]
  const rows = leads.map((l) => [
    new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    l.name, l.phone, l.email, l.message, l.type, l.status,
    l.productId?.name ?? '', l.sourcePath,
    l.utm?.source, l.utm?.medium, l.utm?.campaign,
  ])

  const csv = '\uFEFF' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
  const day = new Date().toISOString().slice(0, 10)

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="leads-${day}.csv"`)
  res.send(csv)
}

// PATCH /api/admin/leads/:id  body: { status }
export async function updateLeadStatus(req, res) {
  assertObjectId(req.params.id, 'Lead')
  const { status } = parseOrThrow(statusSchema, req.body ?? {})

  const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })
    .populate('productId', 'name slug')
    .lean()
  if (!lead) throw new ApiError(404, 'Lead not found')

  res.json({ success: true, data: serialize(lead) })
}

// DELETE /api/admin/leads/:id (spam ya test lead hatane ke liye, pakka delete)
export async function deleteLead(req, res) {
  assertObjectId(req.params.id, 'Lead')
  const lead = await Lead.findByIdAndDelete(req.params.id)
  if (!lead) throw new ApiError(404, 'Lead not found')
  res.json({ success: true, message: 'Lead deleted' })
}