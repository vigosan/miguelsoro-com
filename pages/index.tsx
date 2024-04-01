import { Layout } from "@/components/Layout";
import { List } from "@/components/List";
import { usePictures } from "@/hooks/usePictures";

export default function IndexPage() {
  const pictures = usePictures();

  return (
    <Layout>
      <List items={pictures} />
    </Layout>
  );
}
