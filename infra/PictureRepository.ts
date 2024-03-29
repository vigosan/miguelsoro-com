import { PictureProps } from "@/interfaces/PictureProps";
// import { Picture } from "@/domain/entities/Picture";

export interface PictureRepository {
  findAll(): Promise<PictureProps[]>;
}

export class InMemoryPictureRepository implements PictureRepository {
  private pictures: PictureProps[];

  constructor(pictures: PictureProps[]) {
    this.pictures = pictures;
  }

  async findAll(): Promise<PictureProps[]> {
    return [...this.pictures];
  }
}
