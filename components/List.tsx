import * as React from "react";
import { Picture } from "@/domain/picture";
import { cn } from "@/utils/cn";
import Item from "./Item";

type Props = {
  className?: string;
  items: Picture[];
};

const List = ({ items, className }: Props) => (
  <div
    className={cn(
      "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8",
      className,
    )}
  >
    {items.map((item) => (
      <Item item={item} key={item.id} className="group relative" />
    ))}
  </div>
);

export default List;
