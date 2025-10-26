import { Product, ProductType, ProductAttribute } from "@/domain/product";

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | undefined>;
  findBySlug(slug: string): Promise<Product | undefined>;
  findByProductType(productTypeId: string): Promise<Product[]>;
  create(
    product: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}

export interface ProductTypeRepository {
  findAll(): Promise<ProductType[]>;
  findById(id: string): Promise<ProductType | undefined>;
  findByName(name: string): Promise<ProductType | undefined>;
  create(productType: Omit<ProductType, "id">): Promise<ProductType>;
  update(id: string, productType: Partial<ProductType>): Promise<ProductType>;
  delete(id: string): Promise<void>;
  getAttributes(id: string): Promise<ProductAttribute[]>;
}
