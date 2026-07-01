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
  const altText = `${item.title} - Arte ciclístico de Miguel Soro, obra original ${item.size}cm en acrílico y collage${status === "NOT_AVAILABLE" ? " [NO DISPONIBLE]" : status === "AVAILABLE" ? " disponible para compra" : ""}`;

  return (
    <Link
      href={`/pictures/${item.slug}`}
      data-testid={`picture-link-${item.slug}`}
    >
      <article
        className={cn(
          "group h-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl flex flex-col",
          className,
        )}
        itemScope
        itemType="https://schema.org/VisualArtwork"
        data-testid={`picture-card-${item.slug}`}
      >
        <div className="relative h-80 w-full overflow-hidden bg-gray-50">
          <Image
            src={item.imageUrl}
            alt={altText}
            className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
            width={400}
            height={320}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            itemProp="image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3
            className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200 line-clamp-2 min-h-[2.5rem]"
            itemProp="name"
            data-testid={`picture-title-${item.slug}`}
          >
            {item.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p
              className="text-sm text-gray-500"
              itemProp="size"
              data-testid={`picture-size-${item.slug}`}
            >
              {item.size}cm
            </p>
            {status === "AVAILABLE" && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200"
                itemProp="availability"
                itemType="https://schema.org/InStock"
                data-testid={`picture-status-available-${item.slug}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Disponible
              </span>
            )}
            {status === "NOT_AVAILABLE" && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-gray-400 ring-1 ring-gray-200"
                itemProp="availability"
                itemType="https://schema.org/OutOfStock"
                data-testid={`picture-status-not-available-${item.slug}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                No disponible
              </span>
            )}
          </div>

          {/* Hidden structured data */}
          <meta itemProp="creator" content="Miguel Soro" />
          <meta itemProp="artform" content="Painting" />
          <meta
            itemProp="artMedium"
            content="Acrílico y collage sobre lienzo"
          />
          <meta itemProp="category" content="Cycling Art" />
          <meta
            itemProp="url"
            content={`https://www.miguelsoro.com/pictures/${item.slug}`}
          />
        </div>
      </article>
    </Link>
  );
}
