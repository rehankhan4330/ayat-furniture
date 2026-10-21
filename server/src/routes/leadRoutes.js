import { Router } from 'express'
import { createLead } from '../controllers/leadController.js'
import { leadLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/', leadLimiter, createLead)

export default router