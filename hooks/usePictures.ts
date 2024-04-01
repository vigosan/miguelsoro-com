import { useState, useEffect } from "react";
import { InMemoryPictureRepository } from "@/infra/PictureRepository";
import { findAllPictures } from "@/application/findAllPictures";
import { Picture } from "@/domain/picture";

export const usePictures = () => {
  const [pictures, setPictures] = useState<Picture[]>([]);

  useEffect(() => {
    const fetchPictures = async () => {
      const pictureRepository = new InMemoryPictureRepository();
      const allPictures = await findAllPictures(pictureRepository);
      setPictures(allPictures);
    };

    fetchPictures();
  }, []);

  return pictures;
};
