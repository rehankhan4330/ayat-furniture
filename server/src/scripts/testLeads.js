import readline from 'node:readline'

const BASE = process.env.TEST_API_URL || 'http://localhost:5000/api'

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = (text) => {
      if (hidden && rl.stdoutMuted && !/[\r\n]/.test(text)) rl.output.write('*')
      else rl.output.write(text)
    }
    rl.question(question, (answer) => {
      rl.close()
      if (hidden) process.stdout.write('\n')
      resolve(answer)
    })
    if (hidden) rl.stdoutMuted = true
  })
}

let cookie = ''

async function call(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth && cookie) headers.Cookie = cookie
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const contentType = res.headers.get('content-type') || ''
  const payload = contentType.includes('json') ? await res.json().catch(() => ({})) : await res.text()
  return { status: res.status, json: payload, contentType, setCookie: res.headers.getSetCookie?.() ?? [] }
}

let failures = 0
function check(label, ok, extra = '') {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? '  -> ' + extra : ''}`)
}

async function main() {
  const email = (await ask('Admin email: ')).trim()
  const password = await ask('Password: ', { hidden: true })
  console.log('')

  const login = await call('/admin/login', { method: 'POST', body: { email, password }, auth: false })
  const raw = login.setCookie.find((c) => c.startsWith('admin_token='))
  if (login.status !== 200 || !raw) {
    console.log('Login failed:', login.json.message)
    return
  }
  cookie = raw.split(';')[0]
  check('Login', true)

  const blocked = await call('/admin/leads', { auth: false })
  check('Leads list blocked without login', blocked.status === 401, `status ${blocked.status}`)

  // Public form se lead (is time server terminal mein email ka log bhi dikhega)
  const created = await call('/leads', {
    method: 'POST',
    auth: false,
    body: {
      name: 'ZZ Test Lead',
      phone: '98765 43210',
      email: '',
      message: 'This is a test enquiry for a 3 seater sofa.',
      type: 'callback',
      productSlug: 'sample-sofa-1',
      sourcePath: '/collections/living-room/stationary-sofas/sample-sofa-1',
      utm: { source: 'facebook', medium: 'paid', campaign: 'diwali-test' },
    },
  })
  const leadId = created.json.data?.id
  check('Public lead saved', created.status === 201 && Boolean(leadId), `status ${created.status}`)

  const bot = await call('/leads', {
    method: 'POST',
    auth: false,
    body: { name: 'ZZ Bot Lead', phone: '9876543210', message: 'Bot message here please', website: 'http://spam.example' },
  })
  check('Honeypot bot gets success', bot.status === 201)

  const list = await call('/admin/leads?search=ZZ%20Test')
  const found = list.json.data?.find((l) => l._id === leadId)
  check('Lead appears in admin list', Boolean(found), `${list.json.pagination?.total} match`)
  check('Phone cleaned to 10 digits', found?.phone === '9876543210', found?.phone)
  check('Product linked', found?.product?.slug === 'sample-sofa-1', found?.product?.name)
  check('UTM campaign saved', found?.utm?.campaign === 'diwali-test')
  check('New lead status is "new"', found?.status === 'new')

  const botList = await call('/admin/leads?search=ZZ%20Bot')
  check('Honeypot lead NOT saved', botList.json.pagination?.total === 0)

  const stats = await call('/admin/leads/stats')
  check('Stats work', stats.status === 200 && stats.json.data?.new >= 1, JSON.stringify(stats.json.data))

  const patch = await call(`/admin/leads/${leadId}`, { method: 'PATCH', body: { status: 'contacted' } })
  check('Status change to contacted', patch.status === 200 && patch.json.data?.status === 'contacted')

  const badPatch = await call(`/admin/leads/${leadId}`, { method: 'PATCH', body: { status: 'banana' } })
  check('Invalid status rejected', badPatch.status === 400, `status ${badPatch.status}`)

  const filtered = await call('/admin/leads?status=contacted&search=ZZ%20Test')
  check('Filter by status works', filtered.json.data?.some((l) => l._id === leadId))

  const csv = await call('/admin/leads/export?search=ZZ%20Test')
  check(
    'CSV export',
    csv.status === 200 && csv.contentType.includes('text/csv') && String(csv.json).includes('9876543210'),
    csv.contentType,
  )

  const del = await call(`/admin/leads/${leadId}`, { method: 'DELETE' })
  check('Cleanup: lead deleted', del.status === 200)

  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
  console.log('Now check the server terminal and your LEAD_NOTIFY_EMAIL inbox (also Spam) for the test email.')
}

main().catch((err) => console.error('Test failed to run:', err.message))