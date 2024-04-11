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
    <Link href={getPath(item)}>
      <div className={cn("overflow-hidden", className)}>
        <div className="group relative flex h-96 items-center justify-center lg:max-h-80">
          <div className="aspect-h-1 aspect-w-1 lg:aspect-none absolute top-0 left-0 h-96 w-full bg-gray-200 lg:h-80 lg:max-h-80">
            <Image
              src={getImgPath(item)}
              alt={item.title}
              className="h-full w-full border-18 border-gray-900 object-cover object-top p-8"
              width={260}
              height={320}
            />
          </div>
          <div className="absolute -inset-full top-0 z-1 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 transition-all group-hover:inset-0" />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <h3 className="text-sm text-gray-700">{item.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{item.size}</p>
        </div>
      </div>
    </Link>
  );
}
