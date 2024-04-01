import { Picture } from "@/domain/picture";
import { pictures as pictureData } from "@/data/pictures";

export interface PictureRepository {
  findAll(): Promise<Picture[]>;
  getPictureBySlug(slug: string): Promise<Picture | undefined>;
  getPictureById(id: string): Promise<Picture | undefined>;
}

export class InMemoryPictureRepository implements PictureRepository {
  private pictures: Picture[];

  constructor() {
    this.pictures = [...pictureData];
  }

  async findAll(): Promise<Picture[]> {
    return [...this.pictures];
  }

  async getPictureBySlug(slug: string): Promise<Picture | undefined> {
    return this.pictures.find((picture) => picture.slug === slug);
  }

  async getPictureById(id: string): Promise<Picture | undefined> {
    return this.pictures.find((picture) => picture.id === id);
  }
}
