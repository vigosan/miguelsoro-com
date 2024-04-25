export type Picture = {
  description: string;
  id: string;
  price: number;
  size: string;
  slug: string;
  title: string;
};

export function getPath(picture: Picture): string {
  return `/pictures/${picture.slug}`;
}

export function getImgPath(picture: Picture): string {
  return `/pictures/${picture.id}.webp`;
}
