import { useState, useEffect } from "react";
import { InMemoryPictureRepository } from "@/infra/PictureRepository";
import { Picture } from "@/domain/picture";

export const usePicture = (idOrSlug: string | undefined) => {
  const [picture, setPicture] = useState<Picture | undefined>(undefined);

  useEffect(() => {
    const fetchPicture = async () => {
      if (!idOrSlug) {
        return;
      }

      const pictureRepository = new InMemoryPictureRepository();
      let picture = await pictureRepository.getPictureBySlug(idOrSlug);

      if (!picture) {
        picture = await pictureRepository.getPictureById(idOrSlug);
      }

      setPicture(picture);
    };

    fetchPicture();
  }, [idOrSlug]);

  return picture;
};
