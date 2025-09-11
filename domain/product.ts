export type ProductType = {
  id: string
  name: string
  displayName: string
  description?: string
  isActive: boolean
}

export type AttributeType = 'SELECT' | 'TEXT' | 'NUMBER'

export type ProductAttribute = {
  id: string
  name: string
  displayName: string
  type: AttributeType
  isRequired: boolean
  sortOrder: number
  options?: AttributeOption[]
}

export type AttributeOption = {
  id: string
  value: string
  displayName: string
  sortOrder: number
}

export type ProductVariantAttributeValue = {
  attributeId: string
  optionId?: string
  textValue?: string
  numberValue?: number
}

export type ProductVariant = {
  id: string
  sku?: string
  price: number // price in cents
  stock: number
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED'
  attributeValues: ProductVariantAttributeValue[]
}

export type ProductImage = {
  id: string
  url: string
  altText?: string
  sortOrder: number
  isPrimary: boolean
}

export type Product = {
  id: string
  title: string
  description?: string
  slug: string
  basePrice: number // base price in cents
  isActive: boolean
  productType: ProductType
  variants: ProductVariant[]
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}

export function getProductPath(product: Product): string {
  return `/products/${product.slug}`
}

export function getProductImagePath(product: Product): string {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
  return primaryImage?.url || `/images/placeholder.jpg`
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(priceInCents / 100)
}

export function getAvailableStock(product: Product): number {
  return product.variants
    .filter(variant => variant.status === 'AVAILABLE')
    .reduce((total, variant) => total + variant.stock, 0)
}

export function getLowestPrice(product: Product): number {
  const availableVariants = product.variants.filter(v => v.status === 'AVAILABLE')
  if (availableVariants.length === 0) return product.basePrice
  
  return Math.min(...availableVariants.map(v => v.price))
}

export function getHighestPrice(product: Product): number {
  const availableVariants = product.variants.filter(v => v.status === 'AVAILABLE')
  if (availableVariants.length === 0) return product.basePrice
  
  return Math.max(...availableVariants.map(v => v.price))
}

export function hasVariants(product: Product): boolean {
  return product.variants.length > 1
}

export function isInStock(product: Product): boolean {
  return getAvailableStock(product) > 0
}