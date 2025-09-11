import { Picture } from "@/domain/picture";
import { PictureRepository } from "./PictureRepository";
import { prisma } from "@/lib/prisma";

export class DatabasePictureRepository implements PictureRepository {
  async findAll(): Promise<Picture[]> {
    const pictures = await prisma.picture.findMany({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: { createdAt: 'desc' }
    });

    return pictures.map(this.mapTodomainPicture);
  }

  async getPictureBySlug(slug: string): Promise<Picture | undefined> {
    const picture = await prisma.picture.findUnique({
      where: { slug }
    });

    return picture ? this.mapTodomainPicture(picture) : undefined;
  }

  async getPictureById(id: string): Promise<Picture | undefined> {
    const picture = await prisma.picture.findUnique({
      where: { id }
    });

    return picture ? this.mapTodomainPicture(picture) : undefined;
  }

  private mapTodomainPicture(dbPicture: any): Picture {
    return {
      id: dbPicture.id,
      title: dbPicture.title,
      description: dbPicture.description || '',
      price: dbPicture.price,
      size: dbPicture.size,
      slug: dbPicture.slug,
    };
  }
}