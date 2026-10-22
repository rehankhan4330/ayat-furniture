import { ApiError } from '../utils/ApiError.js'
import { MAX_IMAGE_MB } from '../config/limits.js'

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500
  let message = err.message || 'Something went wrong'
  const fieldErrors = err.isOperational ? err.errors : undefined

  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  }

  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}`
  }

  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue || {})[0] || 'value'
    message = `A record with this ${field} already exists`
  }

  if (err.type === 'entity.parse.failed') {
    statusCode = 400
    message = 'Invalid JSON in request body'
  }

  // (Image upload ke errors)
  if (err.name === 'MulterError') {
    statusCode = 400
    if (err.code === 'LIMIT_FILE_SIZE') message = `Each image must be ${MAX_IMAGE_MB} MB or smaller`
    else if (err.code === 'LIMIT_FILE_COUNT') message = 'You can upload at most 8 images at a time'
    else message = 'Invalid upload. Please send images in the "images" field.'
  }

  if (statusCode >= 500) {
    console.error(err)
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal server error'
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(fieldErrors ? { errors: fieldErrors } : {}),
    ...(process.env.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: err.stack } : {}),
  })
}