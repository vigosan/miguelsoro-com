// Core Picture type - represents a cycling artwork by Miguel Soro
export interface Picture {
  id: string;
  title: string;
  description: string;
  price: number; // Price in cents
  size: string; // e.g., "120x90"
  slug: string;
  imageUrl: string;
  // Database fields for complete data
  productTypeId: string;
  productTypeName: string;
  stock: number; // stock > 0 = available, stock = 0 = not available
  createdAt: string;
  updatedAt: string;
}

// Legacy type for backward compatibility - minimal picture data
export interface BasicPicture {
  id: string;
  title: string;
  description: string;
  price: number;
  size: string;
  slug: string;
}

export type PictureStatus = 'AVAILABLE' | 'NOT_AVAILABLE';

// Computed property - status is derived from stock
export function getPictureStatus(picture: Picture): PictureStatus {
  return picture.stock > 0 ? 'AVAILABLE' : 'NOT_AVAILABLE';
}

// Product variant status from database - for mapping
export type VariantStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

// Helper functions
export function getPath(picture: Picture | BasicPicture): string {
  return `/pictures/${picture.slug}`;
}

export function getImgPath(picture: Picture | BasicPicture): string {
  return `/pictures/${picture.id}.webp`;
}

// Map database VariantStatus to PictureStatus
export function mapVariantStatusToPictureStatus(status: VariantStatus): PictureStatus {
  switch (status) {
    case 'AVAILABLE':
      return 'AVAILABLE';
    case 'OUT_OF_STOCK':
    case 'DISCONTINUED':
      return 'NOT_AVAILABLE'; // Treat both as not available for UI purposes
    default:
      return 'AVAILABLE';
  }
}

// Helper to convert BasicPicture to Picture with defaults
export function enrichPicture(basic: BasicPicture): Picture {
  return {
    ...basic,
    imageUrl: getImgPath(basic),
    productTypeId: 'default',
    productTypeName: 'Cuadros Originales', 
    stock: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
