// (Saari backend requests yahin se jati hain. Pages seedha fetch nahi karte.)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status // (0 = server tak pahunch hi nahi paaye)
    this.errors = errors // (field-wise errors, jaise { phone: '...' })
  }
}

function buildUrl(path, params) {
  const url = new URL(`${API_URL}${path}`, window.location.origin)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    }
  }
  return url
}

const NETWORK_MESSAGE = 'Could not reach the server. Please check your connection and try again.'

async function request(path, { method = 'GET', body, form, params } = {}) {
  let res
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      credentials: 'include', // (login cookie bhejne ke liye)
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: form ?? (body ? JSON.stringify(body) : undefined),
    })
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0)
  }

  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    throw new ApiError(json?.message || 'Something went wrong.', res.status, json?.errors)
  }
  return json
}

// ---------------- Public APIs ----------------
export const getCollections = () => request('/collections').then((r) => r.data)
export const getCollection = (slug) => request(`/collections/${slug}`).then((r) => r.data)
export const getProducts = (params) => request('/products', { params }) // (data + pagination dono chahiye)
export const getProduct = (slug) => request(`/products/${slug}`).then((r) => r.data)
export const submitLead = (data) => request('/leads', { method: 'POST', body: data })

// ---------------- Admin: auth ----------------
export const adminLogin = (email, password) =>
  request('/admin/login', { method: 'POST', body: { email, password } }).then((r) => r.data)
export const adminLogout = () => request('/admin/logout', { method: 'POST' })
export const adminMe = () => request('/admin/me').then((r) => r.data)

// ---------------- Admin: leads ----------------
export const adminLeadStats = () => request('/admin/leads/stats').then((r) => r.data)
export const adminGetLeads = (params) => request('/admin/leads', { params })
export const adminUpdateLead = (id, status) =>
  request(`/admin/leads/${id}`, { method: 'PATCH', body: { status } }).then((r) => r.data)
export const adminDeleteLead = (id) => request(`/admin/leads/${id}`, { method: 'DELETE' })

export async function adminDownloadLeads(params) {
  let res
  try {
    res = await fetch(buildUrl('/admin/leads/export', params), { credentials: 'include' })
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0)
  }
  if (!res.ok) {
    const json = await res.json().catch(() => null)
    throw new ApiError(json?.message || 'Download failed.', res.status)
  }
  const blob = await res.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
}

// ---------------- Admin: catalogue (B2 mein use hoga) ----------------
export const adminGetCollections = () => request('/admin/collections').then((r) => r.data)
export const adminCreateCollection = (body) =>
  request('/admin/collections', { method: 'POST', body }).then((r) => r.data)
export const adminUpdateCollection = (id, body) =>
  request(`/admin/collections/${id}`, { method: 'PUT', body }).then((r) => r.data)
export const adminDeleteCollection = (id) => request(`/admin/collections/${id}`, { method: 'DELETE' })

export const adminGetCategories = (params) => request('/admin/categories', { params }).then((r) => r.data)
export const adminCreateCategory = (body) =>
  request('/admin/categories', { method: 'POST', body }).then((r) => r.data)
export const adminUpdateCategory = (id, body) =>
  request(`/admin/categories/${id}`, { method: 'PUT', body }).then((r) => r.data)
export const adminDeleteCategory = (id) => request(`/admin/categories/${id}`, { method: 'DELETE' })

export const adminGetProducts = (params) => request('/admin/products', { params })
export const adminGetProduct = (id) => request(`/admin/products/${id}`).then((r) => r.data)
export const adminCreateProduct = (body) =>
  request('/admin/products', { method: 'POST', body }).then((r) => r.data)
export const adminUpdateProduct = (id, body) =>
  request(`/admin/products/${id}`, { method: 'PUT', body }).then((r) => r.data)
export const adminDeleteProduct = (id, permanent = false) =>
  request(`/admin/products/${id}`, { method: 'DELETE', params: { permanent: permanent ? 'true' : undefined } })

export function adminUploadImages(files) {
  const form = new FormData()
  for (const file of files) form.append('images', file)
  return request('/admin/upload', { method: 'POST', form }).then((r) => r.data)
}
export const adminDeleteImage = (publicId) =>
  request('/admin/upload', { method: 'DELETE', body: { publicId } })