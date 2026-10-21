export class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors // (field-wise errors, jaise { phone: 'Invalid number' })
    this.isOperational = true
  }
}