import { PictureProps } from "@/interfaces/PictureProps";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatCurrency";
// import { slugify } from "@/utils/slug";
import Image from "next/image";
// import Link from "next/link";

type Props = {
  className?: string;
  item: PictureProps;
};

const Picture = ({ item, className }: Props) => (
  // <Link href={`picture/${slugify(item.title)}`} className="relative">
  <div className={cn("group relative", className)}>
    <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
      <Image
        src={`/pictures/${item.id}.webp`}
        alt={item.title}
        className="h-full w-full object-cover object-center border-8 border-gray-900"
        width={260}
        height={320}
      />
      <p className="rounded m-4 text-sm font-medium text-white bg-gray-900 px-4 py-2 absolute bottom-0 right-0 hidden">
        {formatCurrency(item.price)}
      </p>
    </div>
    <div className="mt-4 flex flex-col gap-2">
      {/* <div>
        <h3 className="text-sm text-gray-700">
          <span aria-hidden="true" className="absolute inset-0" />
          {item.title}
        </h3>
      </div> */}
      <div className="flex justify-between">
        <p className="mt-1 text-sm text-gray-500">{item.size}</p>
      </div>
    </div>
  </div>
  // </Link>
);

export default Picture;
