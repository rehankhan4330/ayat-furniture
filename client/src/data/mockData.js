// (Demo data. Baad mein admin panel / API se aayega.)
// images: [] means a gradient placeholder is shown.
// Real image format later: { url: '...', alt: '...' }

export const collections = [
  { slug: 'living-room', name: 'Living Room', tagline: 'Sofas, chairs and tables for your living space.', image: '' },
  { slug: 'bedroom', name: 'Bedroom', tagline: 'Beds, wardrobes and bedside storage.', image: '' },
  { slug: 'dining', name: 'Dining', tagline: 'Dining tables and chairs for family meals.', image: '' },
  { slug: 'office', name: 'Office & Others', tagline: 'Office chairs, desks and custom furniture.', image: '' },
]

// (Category slug is unique inside its collection.)
export const categories = [
  { slug: 'stationary-sofas', name: 'Stationary Sofas', collectionSlug: 'living-room', description: 'Classic sofas in many sizes and fabrics.', image: '' },
  { slug: 'recliner-sofas', name: 'Recliner Sofas', collectionSlug: 'living-room', description: 'Motion sofas for relaxed seating.', image: '' },
  { slug: 'l-shape-sofas', name: 'L-Shape Sofas', collectionSlug: 'living-room', description: 'Sectional sofas for larger rooms.', image: '' },
  { slug: 'armchairs', name: 'Armchairs', collectionSlug: 'living-room', description: 'Accent chairs and armchairs.', image: '' },
  { slug: 'center-tables', name: 'Center Tables', collectionSlug: 'living-room', description: 'Center tables to match your sofa.', image: '' },
  { slug: 'beds', name: 'Beds', collectionSlug: 'bedroom', description: 'Comfortable beds in many designs.', image: '' },
  { slug: 'bedside-tables', name: 'Bedside Tables', collectionSlug: 'bedroom', description: 'Bedside tables with drawers.', image: '' },
  { slug: 'wardrobes', name: 'Wardrobes', collectionSlug: 'bedroom', description: 'Spacious wardrobes made to fit.', image: '' },
  { slug: 'dining-tables', name: 'Dining Tables', collectionSlug: 'dining', description: 'Dining tables for every family size.', image: '' },
  { slug: 'dining-chairs', name: 'Dining Chairs', collectionSlug: 'dining', description: 'Comfortable dining chairs.', image: '' },
  { slug: 'office-chairs', name: 'Office Chairs', collectionSlug: 'office', description: 'Ergonomic chairs for work.', image: '' },
  { slug: 'work-desks', name: 'Work Desks', collectionSlug: 'office', description: 'Work desks for home and office.', image: '' },
]

const demoDescription =
  'This is a demo description. The real product description will be added from the admin panel.'
const demoMaterials = 'Solid wood frame, high-density foam, fabric upholstery'
const demoColours = ['Beige', 'Grey', 'Green']

// (Product slug is unique across the whole site. Sizes below are demo values only.)
export const products = [
  {
    id: 1, name: 'Sample Sofa 1', slug: 'sample-sofa-1', categorySlug: 'stationary-sofas',
    shortDescription: 'A comfortable three-seater sofa.', description: demoDescription,
    images: [], dimensions: { width: 84, depth: 36, height: 34, unit: 'in' },
    materials: demoMaterials, colours: demoColours,
    specifications: [{ label: 'Seating', value: '3 seater' }, { label: 'Frame', value: 'Solid wood' }],
    customizable: true, featured: true, priceLabel: '',
  },
  {
    id: 2, name: 'Sample Sofa 2', slug: 'sample-sofa-2', categorySlug: 'stationary-sofas',
    shortDescription: 'A compact two-seater sofa.', description: demoDescription,
    images: [], dimensions: { width: 64, depth: 34, height: 33, unit: 'in' },
    materials: demoMaterials, colours: demoColours,
    specifications: [{ label: 'Seating', value: '2 seater' }, { label: 'Frame', value: 'Solid wood' }],
    customizable: true, featured: false, priceLabel: '',
  },
  {
    id: 3, name: 'Sample Recliner', slug: 'sample-recliner', categorySlug: 'recliner-sofas',
    shortDescription: 'A motion sofa with smooth recline.', description: demoDescription,
    images: [], dimensions: { width: 90, depth: 38, height: 40, unit: 'in' },
    materials: demoMaterials, colours: demoColours,
    specifications: [{ label: 'Seating', value: '3 seater' }, { label: 'Mechanism', value: 'Manual recliner' }],
    customizable: false, featured: true, priceLabel: '',
  },
  {
    id: 4, name: 'Sample L-Shape Sofa', slug: 'sample-l-shape-sofa', categorySlug: 'l-shape-sofas',
    shortDescription: 'A spacious sectional sofa.', description: demoDescription,
    images: [], dimensions: { width: 108, depth: 70, height: 34, unit: 'in' },
    materials: demoMaterials, colours: demoColours,
    specifications: [{ label: 'Seating', value: '5 seater' }, { label: 'Layout', value: 'L-shape' }],
    customizable: true, featured: true, priceLabel: '',
  },
  {
    id: 5, name: 'Sample Armchair', slug: 'sample-armchair', categorySlug: 'armchairs',
    shortDescription: 'A stylish accent armchair.', description: demoDescription,
    images: [], dimensions: { width: 30, depth: 32, height: 34, unit: 'in' },
    materials: demoMaterials, colours: demoColours,
    specifications: [{ label: 'Seating', value: '1 seater' }, { label: 'Frame', value: 'Solid wood' }],
    customizable: false, featured: false, priceLabel: '',
  },
  {
    id: 6, name: 'Sample Bed', slug: 'sample-bed', categorySlug: 'beds',
    shortDescription: 'A sturdy bed with storage.', description: demoDescription,
    images: [], dimensions: { width: 66, depth: 84, height: 40, unit: 'in' },
    materials: demoMaterials, colours: demoColours,
    specifications: [{ label: 'Size', value: 'Queen' }, { label: 'Storage', value: 'Hydraulic' }],
    customizable: true, featured: true, priceLabel: '',
  },
  {
    id: 7, name: 'Sample Dining Table', slug: 'sample-dining-table', categorySlug: 'dining-tables',
    shortDescription: 'A six-seater dining table.', description: demoDescription,
    images: [], dimensions: { width: 72, depth: 36, height: 30, unit: 'in' },
    materials: demoMaterials, colours: demoColours,
    specifications: [{ label: 'Seating', value: '6 seater' }, { label: 'Top', value: 'Solid wood' }],
    customizable: true, featured: false, priceLabel: '',
  },
  {
    id: 8, name: 'Sample Office Chair', slug: 'sample-office-chair', categorySlug: 'office-chairs',
    shortDescription: 'An ergonomic office chair.', description: demoDescription,
    images: [], dimensions: { width: 26, depth: 26, height: 44, unit: 'in' },
    materials: demoMaterials, colours: demoColours,
    specifications: [{ label: 'Back', value: 'Mesh' }, { label: 'Base', value: 'Swivel' }],
    customizable: false, featured: false, priceLabel: '',
  },
]

export const featuredProducts = products.filter((p) => p.featured)

export const services = [
  { title: 'Custom Furniture', text: 'Made to your size, design and fabric.' },
  { title: 'Modular Kitchens', text: 'Kitchen cabinets and storage units.' },
  { title: 'Bulk & Interior Projects', text: 'For homes, offices and showrooms.' },
  { title: 'Repair & Reupholstery', text: 'Give your old sofa a fresh new look.' },
]

// ---- Helper functions (baad mein ye API calls se replace honge) ----

export const getCollection = (slug) => collections.find((c) => c.slug === slug)

export const getCategoriesByCollection = (collectionSlug) =>
  categories.filter((c) => c.collectionSlug === collectionSlug)

export const getCategory = (collectionSlug, categorySlug) =>
  categories.find((c) => c.collectionSlug === collectionSlug && c.slug === categorySlug)

export const getProductsByCategory = (categorySlug) =>
  products.filter((p) => p.categorySlug === categorySlug)

export const getProduct = (slug) => products.find((p) => p.slug === slug)

export const getFeaturedByCollection = (collectionSlug) =>
  products.filter((p) => {
    const cat = categories.find((c) => c.slug === p.categorySlug)
    return p.featured && cat && cat.collectionSlug === collectionSlug
  })

export const getProductPath = (product) => {
  const cat = categories.find((c) => c.slug === product.categorySlug)
  return `/collections/${cat.collectionSlug}/${cat.slug}/${product.slug}`
}

// (Pehle same category ke products, phir same collection ke baaki.)
export const getRelatedProducts = (product, limit = 4) => {
  const cat = categories.find((c) => c.slug === product.categorySlug)
  const sameCategory = products.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id,
  )
  const sameCollection = products.filter((p) => {
    const c = categories.find((x) => x.slug === p.categorySlug)
    return c && c.collectionSlug === cat.collectionSlug && p.categorySlug !== product.categorySlug
  })
  return [...sameCategory, ...sameCollection].slice(0, limit)
}