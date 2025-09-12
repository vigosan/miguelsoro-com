import Image from "next/image";
import Link from "next/link";
import { Picture } from "@/hooks/usePicturesPublic";
import { cn } from "@/utils/cn";

type Props = {
  className?: string;
  item: Picture;
};

export function Item({ item, className }: Props) {
  return (
    <Link href={`/pictures/${item.slug}`}>
      <div className={cn("h-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col", className)}>
        <div className="group relative h-80 w-full bg-gray-50">
          <Image
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover group-hover:opacity-90 transition-opacity duration-200"
            width={400}
            height={320}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200 line-clamp-2 min-h-[2.5rem]">
            {item.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-500">{item.size}</p>
            {item.status === 'AVAILABLE' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Disponible
              </span>
            )}
            {item.status === 'SOLD' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Vendido
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
