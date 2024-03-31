import { Picture } from "@/domain/picture";
import { PictureRepository } from "@/infra/PictureRepository";

export function findPictureBySlug(
  pictureRepository: PictureRepository,
  slug: string,
): Promise<Picture | undefined> {
  return pictureRepository.getPictureBySlug(slug);
}
