import readline from 'node:readline'

const BASE = process.env.TEST_API_URL || 'http://localhost:5000/api'

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    })

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

async function call(path, { method = 'GET', body, cookie = '' } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  const setCookie = res.headers.getSetCookie?.() ?? []
  return { status: res.status, json, setCookie }
}

function check(label, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? '  -> ' + extra : ''}`)
}

async function main() {
  const email = (await ask('Admin email: ')).trim()
  const password = await ask('Password: ', { hidden: true })
  console.log('')

  // 1. Login
  const login = await call('/admin/login', { method: 'POST', body: { email, password } })
  check('Login with correct details', login.status === 200 && login.json.success, `status ${login.status}`)

  const rawCookie = login.setCookie.find((c) => c.startsWith('admin_token='))
  check('Login sets admin_token cookie', Boolean(rawCookie))
  check('Cookie is httpOnly', Boolean(rawCookie) && /httponly/i.test(rawCookie))

  if (!rawCookie) {
    console.log('\nLogin failed. Server message:', login.json.message)
    return
  }
  const cookie = rawCookie.split(';')[0]

  // 2. /me with cookie
  const me = await call('/admin/me', { cookie })
  check('/me works with cookie', me.status === 200 && me.json.success, me.json.data?.email)

  // 3. /me without cookie
  const noCookie = await call('/admin/me')
  check('/me blocked without cookie', noCookie.status === 401, `status ${noCookie.status}`)

  // 4. Wrong password
  const bad = await call('/admin/login', { method: 'POST', body: { email, password: password + 'x' } })
  check('Wrong password rejected', bad.status === 401, `status ${bad.status}`)

  // 5. Logout
  const logout = await call('/admin/logout', { method: 'POST', cookie })
  check('Logout clears cookie', logout.status === 200 && logout.setCookie.some((c) => c.startsWith('admin_token=;')))
}

main().catch((err) => console.error('Test failed to run:', err.message))