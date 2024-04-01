import Image from "next/image";
import Link from "next/link";
import { Picture } from "@/domain/picture";
import { cn } from "@/utils/cn";
import { getPath, getImgPath } from "@/domain/picture";

type Props = {
  className?: string;
  item: Picture;
};

export function Item({ item, className }: Props) {
  return (
    <Link href={getPath(item)} className="relative">
      <div className={cn("group relative", className)}>
        <div className="aspect-h-1 aspect-w-1 lg:aspect-none h:96 w-full overflow-hidden bg-gray-200 group-hover:opacity-75 lg:h-80 --lg:max-h-80">
          <Image
            src={getImgPath(item)}
            alt={item.title}
            className="w-full h-96 lg:h-80 border-18 border-gray-900 object-cover object-top p-8 group-hover:opacity-75"
            width={260}
            height={320}
          />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div>
            <h3 className="text-sm text-gray-700">
              <span aria-hidden="true" className="absolute inset-0" />
              {item.title}
            </h3>
          </div>
          <div className="flex justify-between">
            <p className="mt-1 text-sm text-gray-500">{item.size}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
