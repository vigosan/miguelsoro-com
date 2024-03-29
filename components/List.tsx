import * as React from "react";
import { PictureProps } from "@/interfaces/PictureProps";
import { cn } from "@/utils/cn";
import Picture from "./Picture";

type Props = {
  className?: string;
  items: PictureProps[];
};

const List = ({ items, className }: Props) => (
  <div
    className={cn(
      "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8",
      className,
    )}
  >
    {items.map((item) => (
      <Picture item={item} key={item.id} className="group relative" />
    ))}
  </div>
);

export default List;
