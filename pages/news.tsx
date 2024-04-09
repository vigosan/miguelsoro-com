import Link from "next/link";
import { Layout } from "@/components/Layout";

function NewsPage() {
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 lg:gap-1">
          <video controls className="aspect-video h-auto w-full">
            <source src="/videos/tve1.mp4" type="video/mp4" />
            <source src="/videos/tve1.ogg" type="video/ogg" />
            Your browser does not support the video tag.
          </video>
          <a
            className="text-center text-xs lg:text-right"
            href="https://www.rtve.es/play/videos/telediario-1/exposicion-miguel-soro-pone-acento-espanol-homenaje-pau-vencedores-espanoles-del-tour/5377156/"
          >
            fuente rtve
          </a>
        </div>
      </div>
    </Layout>
  );
}

NewsPage.Link = function NewsPageLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href="/news" className={className}>
      {children}
    </Link>
  );
};

export default NewsPage;
