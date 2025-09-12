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

    return products.map(product => this.mapToDomainPicture(product));
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
    
    const priceInCents = variant ? variant.price : dbProduct.basePrice;
    const priceInEuros = priceInCents ? priceInCents / 100 : 0; // Convert cents to euros

    return {
      id: dbProduct.id,
      title: dbProduct.title,
      description: dbProduct.description || '',
      price: priceInEuros, // Price in euros
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

  async create(pictureData: Omit<Picture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Picture> {
    throw new Error('Picture creation not implemented yet - requires complex Product/Variant creation');
  }

  async update(id: string, pictureData: any): Promise<Picture> {
    const { title, description, price, slug, status, stock, productTypeId, imageUrl } = pictureData;
    
    // Update product
    const productUpdateData: any = {};
    if (title) productUpdateData.title = title;
    if (description !== undefined) productUpdateData.description = description;
    if (price) productUpdateData.basePrice = Math.round(price * 100); // Convert euros to cents
    if (slug) productUpdateData.slug = slug;
    if (productTypeId) productUpdateData.productTypeId = productTypeId;

    if (Object.keys(productUpdateData).length > 0) {
      await prisma.product.update({
        where: { id },
        data: productUpdateData
      });
    }

    // Update or create product image if provided
    if (imageUrl) {
      // First, update existing primary image or create new one
      const existingImage = await prisma.productImage.findFirst({
        where: { productId: id, isPrimary: true }
      });

      if (existingImage) {
        await prisma.productImage.update({
          where: { id: existingImage.id },
          data: { url: imageUrl }
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: imageUrl,
            isPrimary: true,
            sortOrder: 0
          }
        });
      }
    }

    // Update variant price and stock
    const variantUpdateData: any = {};
    if (price) variantUpdateData.price = Math.round(price * 100); // Convert euros to cents
    if (stock !== undefined) variantUpdateData.stock = stock;

    // Update variant status
    if (status) {
      const variantStatus = status === 'AVAILABLE' ? 'AVAILABLE' : 
                          status === 'SOLD' ? 'OUT_OF_STOCK' : 'AVAILABLE';
      variantUpdateData.status = variantStatus;
    }

    if (Object.keys(variantUpdateData).length > 0) {
      await prisma.productVariant.updateMany({
        where: { productId: id },
        data: variantUpdateData
      });
    }

    // Return updated picture
    const updatedPicture = await this.getPictureById(id);
    if (!updatedPicture) {
      throw new Error('Picture not found after update');
    }
    
    return updatedPicture;
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }

  // Helper method to extract size from title (e.g., "Obra 120x90" -> "120x90")
  private extractSizeFromTitle(title: string): string | null {
    const sizeMatch = title.match(/(\d+)x(\d+)/);
    return sizeMatch ? sizeMatch[0] : null;
  }
}