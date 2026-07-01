import * as React from "react";
import { Item } from "./Item";
import { Reveal } from "./Reveal";
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
      data-testid="pictures-list"
    >
      {items.map((item, index) => (
        <Reveal key={item.id} delay={(index % 3) * 100}>
          <Item item={item} />
        </Reveal>
      ))}
    </div>
  );
}
