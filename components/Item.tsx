import Image from "next/image";
import Link from "next/link";
import { Picture, getPictureStatus } from "@/domain/picture";
import { cn } from "@/utils/cn";

type Props = {
  className?: string;
  item: Picture;
};

export function Item({ item, className }: Props) {
  const status = getPictureStatus(item);

  // SEO-optimized alt text for images
  const altText = `${item.title} - Arte ciclístico de Miguel Soro, obra original ${item.size}cm en acrílico y collage${status === "AVAILABLE" ? " disponible para compra" : ""}`;

  return (
    <Link
      href={`/pictures/${item.slug}`}
      data-testid={`picture-link-${item.slug}`}
      className={cn("group block", className)}
    >
      <article
        itemScope
        itemType="https://schema.org/VisualArtwork"
        data-testid={`picture-card-${item.slug}`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
          <Image
            src={item.imageUrl}
            alt={altText}
            className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.04]"
            width={480}
            height={600}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            itemProp="image"
          />
          {status === "NOT_AVAILABLE" && (
            <span
              className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-white/95 backdrop-blur-sm"
              itemProp="availability"
              itemType="https://schema.org/OutOfStock"
              data-testid={`picture-status-not-available-${item.slug}`}
            >
              Colección privada
            </span>
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3
            className="text-base text-gray-900 group-hover:text-gray-500 transition-colors duration-200 text-balance"
            itemProp="name"
            data-testid={`picture-title-${item.slug}`}
          >
            {item.title}
          </h3>
          <p
            className="shrink-0 text-sm text-gray-400 tabular-nums"
            itemProp="size"
            data-testid={`picture-size-${item.slug}`}
          >
            {item.size}cm
          </p>
        </div>
        {status === "AVAILABLE" && (
          <span
            className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-500"
            itemProp="availability"
            itemType="https://schema.org/InStock"
            data-testid={`picture-status-available-${item.slug}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Disponible
          </span>
        )}

        {/* Hidden structured data */}
        <meta itemProp="creator" content="Miguel Soro" />
        <meta itemProp="artform" content="Painting" />
        <meta itemProp="artMedium" content="Acrílico y collage sobre lienzo" />
        <meta itemProp="category" content="Cycling Art" />
        <meta
          itemProp="url"
          content={`https://www.miguelsoro.com/pictures/${item.slug}`}
        />
      </article>
    </Link>
  );
}
