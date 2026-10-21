import 'dotenv/config'
import readline from 'node:readline'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Admin from '../models/Admin.js'

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    })

    // (Password type karte waqt screen par * dikhao.)
    rl._writeToOutput = (text) => {
      if (hidden && rl.stdoutMuted && !/[\r\n]/.test(text)) {
        rl.output.write('*')
      } else {
        rl.output.write(text)
      }
    }

    rl.question(question, (answer) => {
      rl.close()
      if (hidden) process.stdout.write('\n')
      resolve(answer)
    })
    if (hidden) rl.stdoutMuted = true
  })
}

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_ADMIN_SETUP !== 'true') {
    throw new Error('Admin setup is blocked in production. Set ALLOW_ADMIN_SETUP=true temporarily to run it.')
  }

  const email = (await ask('Admin email: ')).trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please enter a valid email address.')

  const password = await ask('Password (min 10 characters): ', { hidden: true })
  if (password.length < 10) throw new Error('Password must be at least 10 characters.')

  const confirm = await ask('Confirm password: ', { hidden: true })
  if (password !== confirm) throw new Error('Passwords do not match.')

  await connectDB()
  const passwordHash = await Admin.hashPassword(password)

  const existing = await Admin.findOne({ email })
  if (existing) {
    existing.passwordHash = passwordHash
    await existing.save()
    console.log(`Password updated for existing admin: ${email}`)
  } else {
    await Admin.create({ email, passwordHash })
    console.log(`Admin created: ${email}`)
  }
}

main()
  .catch((err) => {
    console.error('Failed:', err.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())