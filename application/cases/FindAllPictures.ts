import { PictureProps } from "@/interfaces/PictureProps";
import { PictureRepository } from "@/infra/PictureRepository";

export class FindAllPictures {
  constructor(private pictureRepository: PictureRepository) {}

  execute(): Promise<PictureProps[]> {
    return this.pictureRepository.findAll();
  }
}
