import { ApiError } from './ApiError.js'

// (Zod schema se data check karta hai. Galat ho toh 400 error, field-wise messages ke saath.)
export function parseOrThrow(schema, data) {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || 'request'
      if (!errors[key]) errors[key] = issue.message
    }
    throw new ApiError(400, 'Please correct the highlighted fields', errors)
  }

  return result.data
}