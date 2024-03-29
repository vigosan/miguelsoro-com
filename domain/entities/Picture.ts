import { PictureProps } from "@/interfaces/PictureProps";

export class Picture implements PictureProps {
  id: string;
  imgUrl: string;
  price: number;
  size: string;
  title: string;

  constructor({ id, imgUrl, price, size, title }: PictureProps) {
    this.id = id;
    this.imgUrl = imgUrl;
    this.price = price;
    this.size = size;
    this.title = title;
  }
}
