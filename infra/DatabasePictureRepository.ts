import { Picture, mapVariantStatusToPictureStatus, VariantStatus } from "@/domain/picture";
import { PictureRepository } from "./PictureRepository";
import { prisma } from "@/lib/prisma";
import { Product, ProductImage, ProductType, ProductVariant } from "@prisma/client";

type ProductWithRelations = Product & {
  images: ProductImage[];
  productType: ProductType;
  variants: (ProductVariant & { stock?: number })[];
};

export class DatabasePictureRepository implements PictureRepository {
  async findAll(): Promise<Picture[]> {
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        productType: true,
        variants: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return products.map(this.mapToDomainPicture);
  }

  async getPictureBySlug(slug: string): Promise<Picture | undefined> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        productType: true,
        variants: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return product ? this.mapToDomainPicture(product) : undefined;
  }

  async getPictureById(id: string): Promise<Picture | undefined> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        productType: true,
        variants: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return product ? this.mapToDomainPicture(product) : undefined;
  }

  private mapToDomainPicture(dbProduct: ProductWithRelations): Picture {
    const variant = dbProduct.variants[0];
    const image = dbProduct.images[0];
    
    return {
      id: dbProduct.id,
      title: dbProduct.title,
      description: dbProduct.description || '',
      price: variant ? variant.price : dbProduct.basePrice, // Price in cents
      size: this.extractSizeFromTitle(dbProduct.title) || '120x90', // Default size
      slug: dbProduct.slug,
      imageUrl: image ? image.url : `/pictures/${dbProduct.id}.webp`, // Fallback to convention
      status: variant ? mapVariantStatusToPictureStatus(variant.status as VariantStatus) : 'AVAILABLE',
      productTypeId: dbProduct.productTypeId,
      productTypeName: dbProduct.productType?.displayName || 'Cuadros Originales',
      stock: variant ? variant.stock : 1,
      createdAt: dbProduct.createdAt.toISOString(),
      updatedAt: dbProduct.updatedAt.toISOString()
    };
  }

  // Helper method to extract size from title (e.g., "Obra 120x90" -> "120x90")
  private extractSizeFromTitle(title: string): string | null {
    const sizeMatch = title.match(/(\d+)x(\d+)/);
    return sizeMatch ? sizeMatch[0] : null;
  }
}