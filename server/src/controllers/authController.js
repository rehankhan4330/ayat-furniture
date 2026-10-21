import jwt from 'jsonwebtoken'
import { z } from 'zod'
import Admin from '../models/Admin.js'
import { ApiError } from '../utils/ApiError.js'
import { parseOrThrow } from '../utils/validate.js'
import { COOKIE_NAME, SESSION_DAYS, getCookieOptions } from '../utils/authCookie.js'

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.').max(200),
})

// (Admin na mile tab bhi bcrypt chalta hai, taaki response time se pata na chale ki email sahi tha ya nahi.)
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO5bW1lFrYB7WZ5Wl8qL1l5v8V9q2m7yS'

// POST /api/admin/login
export async function login(req, res) {
  const { email, password } = parseOrThrow(loginSchema, req.body ?? {})

  const admin = await Admin.findOne({ email }).select('+passwordHash')
  const isValid = admin
    ? await admin.comparePassword(password)
    : await Admin.comparePasswordWithHash(password, DUMMY_HASH)

  if (!admin || !isValid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const token = jwt.sign({ sub: String(admin._id) }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: `${SESSION_DAYS}d`,
  })

  res.cookie(COOKIE_NAME, token, {
    ...getCookieOptions(),
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  })

  res.json({
    success: true,
    message: 'Logged in successfully',
    data: { id: admin._id, email: admin.email },
  })
}

// POST /api/admin/logout
export async function logout(req, res) {
  res.clearCookie(COOKIE_NAME, getCookieOptions())
  res.json({ success: true, message: 'Logged out' })
}

// GET /api/admin/me
export async function me(req, res) {
  res.json({
    success: true,
    data: { id: req.admin._id, email: req.admin.email },
  })
}