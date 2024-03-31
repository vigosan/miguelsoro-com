import { Picture } from "@/domain/picture";
import { PictureRepository } from "@/infra/PictureRepository";

export function findAllPictures(
  pictureRepository: PictureRepository,
): Promise<Picture[]> {
  return pictureRepository.findAll();
}
