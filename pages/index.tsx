import Link from "next/link";
import { Layout } from "@/components/Layout";
import { List } from "@/components/List";
import { usePictures } from "@/hooks/usePictures";

function IndexPage() {
  const pictures = usePictures();

  return (
    <Layout>
      <List items={pictures} />
    </Layout>
  );
}

IndexPage.Link = function IndexPageLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href="/" className={className}>
      {children}
    </Link>
  );
};

export default IndexPage;
