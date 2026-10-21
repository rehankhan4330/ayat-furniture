export function productPath(product) {
  const collection = product.collection?.slug
  const category = product.category?.slug
  if (!collection || !category) return '/collections'
  return `/collections/${collection}/${category}/${product.slug}`
}

export const mainImage = (product) => product.images?.[0]