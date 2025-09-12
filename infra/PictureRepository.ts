import { Picture } from "@/domain/picture";
import { pictures as pictureData } from "@/data/pictures";

export interface PictureRepository {
  findAll(): Promise<Picture[]>;
  getPictureBySlug(slug: string): Promise<Picture | undefined>;
  getPictureById(id: string): Promise<Picture | undefined>;
  create(pictureData: Omit<Picture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Picture>;
  update(id: string, pictureData: Partial<Picture>): Promise<Picture>;
  delete(id: string): Promise<void>;
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

  async create(pictureData: Omit<Picture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Picture> {
    throw new Error('Create not implemented in InMemoryPictureRepository');
  }

  async update(id: string, pictureData: Partial<Picture>): Promise<Picture> {
    throw new Error('Update not implemented in InMemoryPictureRepository');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Delete not implemented in InMemoryPictureRepository');
  }
}
