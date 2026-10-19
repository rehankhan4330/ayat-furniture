import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

export default app