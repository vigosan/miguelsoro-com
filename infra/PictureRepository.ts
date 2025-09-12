import { Picture, getPictureStatus } from "@/domain/picture";
// TODO: Fix this import after data migration is complete
// import { pictures as pictureData } from "@/data/pictures";

export interface PictureRepository {
  findAll(filters?: {
    productType?: string;
    inStock?: boolean;
    status?: 'AVAILABLE' | 'NOT_AVAILABLE';
  }): Promise<Picture[]>;
  getPictureBySlug(slug: string): Promise<Picture | undefined>;
  getPictureById(id: string): Promise<Picture | undefined>;
  create(pictureData: Omit<Picture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Picture>;
  update(id: string, pictureData: Partial<Picture>): Promise<Picture>;
  delete(id: string): Promise<void>;
}

export class InMemoryPictureRepository implements PictureRepository {
  private pictures: Picture[];

  constructor() {
    // TODO: Fix this after data migration is complete
    this.pictures = []; // [...pictureData];
  }

  async findAll(filters?: {
    productType?: string;
    inStock?: boolean;
    status?: 'AVAILABLE' | 'NOT_AVAILABLE';
  }): Promise<Picture[]> {
    let results = [...this.pictures];

    // Filter by product type
    if (filters?.productType) {
      results = results.filter(picture => 
        picture.productTypeName.toLowerCase().includes(filters.productType!.toLowerCase())
      );
    }

    // Filter by stock availability
    if (filters?.inStock !== undefined) {
      results = results.filter(picture => {
        if (filters.inStock) {
          return picture.stock > 0;
        } else {
          return picture.stock === 0;
        }
      });
    }

    // Filter by status
    if (filters?.status) {
      results = results.filter(picture => getPictureStatus(picture) === filters.status);
    }

    return results;
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
