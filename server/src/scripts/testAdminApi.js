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

async function call(path, { method = 'GET', body, form, auth = true } = {}) {
  const headers = {}
  if (!form) headers['Content-Type'] = 'application/json'
  if (auth && cookie) headers.Cookie = cookie
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, json, setCookie: res.headers.getSetCookie?.() ?? [] }
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

  // Login
  const login = await call('/admin/login', { method: 'POST', body: { email, password }, auth: false })
  const raw = login.setCookie.find((c) => c.startsWith('admin_token='))
  if (login.status !== 200 || !raw) {
    console.log('Login failed:', login.json.message)
    return
  }
  cookie = raw.split(';')[0]
  check('Login', true)

  // Bina login ke admin API band honi chahiye
  const blocked = await call('/admin/collections', {
    method: 'POST',
    body: { name: 'Hacker Collection' },
    auth: false,
  })
  check('Create collection blocked without login', blocked.status === 401, `status ${blocked.status}`)

  // Collection
  const col = await call('/admin/collections', {
    method: 'POST',
    body: { name: 'Test Collection', slug: 'zz-test-collection', tagline: 'Temporary test' },
  })
  const colId = col.json.data?._id
  check('Create collection', col.status === 201 && Boolean(colId), `status ${col.status}`)

  const dup = await call('/admin/collections', { method: 'POST', body: { name: 'Another', slug: 'zz-test-collection' } })
  check('Duplicate slug rejected', dup.status === 409, dup.json.message)

  const badCol = await call('/admin/collections', { method: 'POST', body: { name: 'A' } })
  check('Invalid collection data rejected', badCol.status === 400, `status ${badCol.status}`)

  // Category
  const cat = await call('/admin/categories', {
    method: 'POST',
    body: { name: 'Test Category', slug: 'zz-test-category', collectionId: colId },
  })
  const catId = cat.json.data?._id
  check('Create category', cat.status === 201 && Boolean(catId), `status ${cat.status}`)

  const badCat = await call('/admin/categories', {
    method: 'POST',
    body: { name: 'Orphan', collectionId: '507f1f77bcf86cd799439011' },
  })
  check('Category with unknown collection rejected', badCat.status === 400, badCat.json.message)

  // Product
  const prod = await call('/admin/products', {
    method: 'POST',
    body: {
      name: 'Test Product',
      slug: 'zz-test-product',
      categoryId: catId,
      shortDescription: 'Temporary test product',
      colours: ['Red', 'Blue'],
      dimensions: { width: 80, depth: 35, height: 34, unit: 'in' },
      featured: true,
    },
  })
  const prodId = prod.json.data?._id
  check('Create product', prod.status === 201 && Boolean(prodId), `status ${prod.status}`)

  const badProd = await call('/admin/products', { method: 'POST', body: { name: 'No category' } })
  check('Product without category rejected', badProd.status === 400, `status ${badProd.status}`)

  const publicBefore = await call('/products/zz-test-product', { auth: false })
  check('Active product visible on public API', publicBefore.status === 200, `status ${publicBefore.status}`)

  // Edit
  const edit = await call(`/admin/products/${prodId}`, { method: 'PUT', body: { shortDescription: 'Edited text' } })
  check('Edit product', edit.status === 200 && edit.json.data?.shortDescription === 'Edited text')

  // Deactivate
  const off = await call(`/admin/products/${prodId}`, { method: 'DELETE' })
  check('Delete = deactivate', off.status === 200 && off.json.data?.isActive === false)

  const publicAfter = await call('/products/zz-test-product', { auth: false })
  check('Deactivated product hidden from public', publicAfter.status === 404, `status ${publicAfter.status}`)

  const adminStill = await call(`/admin/products/${prodId}`)
  check('Deactivated product still in admin', adminStill.status === 200)

  // Category me product hai toh category delete nahi honi chahiye
  const catBlocked = await call(`/admin/categories/${catId}`, { method: 'DELETE' })
  check('Category with products cannot be deleted', catBlocked.status === 409, `status ${catBlocked.status}`)

  // Image upload (Cloudinary set na ho toh SKIP)
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  const form = new FormData()
  form.append('images', new Blob([Buffer.from(pngBase64, 'base64')], { type: 'image/png' }), 'test.png')
  const up = await call('/admin/upload', { method: 'POST', form })

  if (up.status === 503) {
    console.log('SKIP  Image upload (Cloudinary keys not set in .env)')
  } else {
    const img = up.json.data?.[0]
    check('Image upload', up.status === 201 && Boolean(img?.url), up.json.message || img?.url)
    if (img?.publicId) {
      const rm = await call('/admin/upload', { method: 'DELETE', body: { publicId: img.publicId } })
      check('Image delete', rm.status === 200, `status ${rm.status}`)
    }
  }

  const noFile = await call('/admin/upload', { method: 'POST', form: new FormData() })
  check('Upload without file rejected', noFile.status === 400, `status ${noFile.status}`)

  // Safai
  const delProd = await call(`/admin/products/${prodId}?permanent=true`, { method: 'DELETE' })
  check('Cleanup: product deleted', delProd.status === 200)
  const delCat = await call(`/admin/categories/${catId}`, { method: 'DELETE' })
  check('Cleanup: category deleted', delCat.status === 200)
  const delCol = await call(`/admin/collections/${colId}`, { method: 'DELETE' })
  check('Cleanup: collection deleted', delCol.status === 200)

  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
}

main().catch((err) => console.error('Test failed to run:', err.message))