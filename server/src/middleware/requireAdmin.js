import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import { ApiError } from '../utils/ApiError.js'
import { COOKIE_NAME } from '../utils/authCookie.js'

export async function requireAdmin(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) throw new ApiError(401, 'Please log in to continue')

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again.')
  }

  const admin = await Admin.findById(payload.sub).select('email createdAt')
  if (!admin) throw new ApiError(401, 'Your session is no longer valid. Please log in again.')

  req.admin = admin
  next()
}