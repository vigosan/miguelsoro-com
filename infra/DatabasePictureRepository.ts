import { Picture } from "@/domain/picture";
import { PictureRepository } from "./PictureRepository";
import { prisma } from "@/lib/prisma";

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
        }
      }
    });

    return products.map(this.mapTodomainPicture);
  }

  async getPictureBySlug(slug: string): Promise<Picture | undefined> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        }
      }
    });

    return product ? this.mapTodomainPicture(product) : undefined;
  }

  async getPictureById(id: string): Promise<Picture | undefined> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        }
      }
    });

    return product ? this.mapTodomainPicture(product) : undefined;
  }

  private mapTodomainPicture(dbProduct: any): Picture {
    return {
      id: dbProduct.id,
      title: dbProduct.title,
      description: dbProduct.description || '',
      price: dbProduct.basePrice / 100,
      size: '40x60',
      slug: dbProduct.slug,
    };
  }
}