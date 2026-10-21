import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import routes from './routes/index.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// (Live server proxy ke peeche hota hai. TRUST_PROXY = kitne proxy hop ke baad asli user ka IP milta hai.)
const trustProxy = Number(process.env.TRUST_PROXY || 0)
if (trustProxy > 0) {
  app.set('trust proxy', trustProxy)
}

app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use('/api', apiLimiter)

app.get('/api/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting']
  res.json({
    success: true,
    message: 'Server is running',
    database: dbStates[mongoose.connection.readyState] || 'unknown',
  })
})

app.use('/api', routes)

// Hamesha sabse neeche rakhna
app.use(notFound)
app.use(errorHandler)

export default app