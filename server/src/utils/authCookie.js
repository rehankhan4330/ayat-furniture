export const COOKIE_NAME = 'admin_token'
export const SESSION_DAYS = 7

// (Cookie ki settings. httpOnly = JavaScript cookie padh nahi sakta. secure = sirf HTTPS par.)
export function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  const allowed = ['lax', 'strict', 'none']
  let sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase()
  if (!allowed.includes(sameSite)) sameSite = 'lax'

  return {
    httpOnly: true,
    secure: isProd || sameSite === 'none',
    sameSite,
    path: '/',
  }
}