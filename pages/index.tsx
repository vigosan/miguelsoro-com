import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { FindAllPictures } from "@/application/cases/FindAllPictures";
import { InMemoryPictureRepository } from "@/infra/PictureRepository";
import { pictureData } from "@/data/pictures";
import List from "@/components/List";
import { PictureProps } from "@/interfaces/PictureProps";

export default function IndexPage() {
  const [pictures, setPictures] = useState<PictureProps[]>([]);

  useEffect(() => {
    const pictureRepository = new InMemoryPictureRepository(pictureData);
    const findAllPictures = new FindAllPictures(pictureRepository);

    // Ejecuta tu caso de uso y guarda el resultado en el estado de tu componente
    findAllPictures.execute().then((pictures) => setPictures(pictures));
  }, []);

  return (
    <Layout>
      <List items={pictures} />
    </Layout>
  );
}
