import * as React from "react";
import { Item } from "./Item";
import { Picture } from "@/domain/picture";
import { cn } from "@/utils/cn";

type Props = {
  className?: string;
  items: Picture[];
};

export function List({ items, className }: Props) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <Item item={item} key={item.id} />
      ))}
    </div>
  );
}
