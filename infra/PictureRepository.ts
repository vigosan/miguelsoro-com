import { Picture } from "@/domain/picture";

export interface PictureRepository {
  findAll(): Promise<Picture[]>;
  getPictureBySlug(slug: string): Promise<Picture | undefined>;
}

export class InMemoryPictureRepository implements PictureRepository {
  private pictures: Picture[];

  constructor(picture: Picture[]) {
    this.pictures = [...picture];
  }

  async findAll(): Promise<Picture[]> {
    return [...this.pictures];
  }

  async getPictureBySlug(slug: string): Promise<Picture | undefined> {
    return this.pictures.find((picture) => picture.slug === slug);
  }
}
