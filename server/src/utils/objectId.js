import { ApiError } from './ApiError.js'

// (URL mein galat id aaye toh seedha 404, database tak jaane se pehle.)
export function assertObjectId(id, label = 'Record') {
  if (!/^[a-f\d]{24}$/i.test(String(id))) {
    throw new ApiError(404, `${label} not found`)
  }
}