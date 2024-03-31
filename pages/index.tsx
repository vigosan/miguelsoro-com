import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import List from "@/components/List";
import { InMemoryPictureRepository } from "@/infra/PictureRepository";
import { Picture } from "@/domain/picture";
import { findAllPictures } from "@/application/findAllPictures";
import { pictures as pictureData } from "@/data/pictures";

export default function IndexPage() {
  const [pictures, setPictures] = useState<Picture[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const pictureRepository = new InMemoryPictureRepository(pictureData);
      const all = await findAllPictures(pictureRepository);
      setPictures(all);
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <List items={pictures} />
    </Layout>
  );
}
