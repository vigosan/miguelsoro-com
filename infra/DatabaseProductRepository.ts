import { Product, ProductType, ProductAttribute } from "@/domain/product";
import { ProductRepository, ProductTypeRepository } from "./ProductRepository";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";

export class DatabaseProductRepository implements ProductRepository {
  async findAll(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        productType: true,
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true,
                option: true,
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(this.mapToDomainProduct);
  }

  async findById(id: string): Promise<Product | undefined> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productType: true,
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true,
                option: true,
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return product ? this.mapToDomainProduct(product) : undefined;
  }

  async findBySlug(slug: string): Promise<Product | undefined> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        productType: true,
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true,
                option: true,
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return product ? this.mapToDomainProduct(product) : undefined;
  }

  async findByProductType(productTypeId: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { 
        productTypeId,
        isActive: true 
      },
      include: {
        productType: true,
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true,
                option: true,
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(this.mapToDomainProduct);
  }

  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    // This would be a complex implementation for creating products with variants
    // For now, we'll throw an error as this needs to be implemented based on specific needs
    throw new Error('Product creation not implemented yet');
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    // This would be a complex implementation for updating products with variants
    // For now, we'll throw an error as this needs to be implemented based on specific needs
    throw new Error('Product update not implemented yet');
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }

  private mapToDomainProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      title: dbProduct.title,
      description: dbProduct.description,
      slug: dbProduct.slug,
      basePrice: dbProduct.basePrice,
      isActive: dbProduct.isActive,
      productType: {
        id: dbProduct.productType.id,
        name: dbProduct.productType.name,
        displayName: dbProduct.productType.displayName,
        description: dbProduct.productType.description,
        isActive: dbProduct.productType.isActive,
      },
      variants: dbProduct.variants.map((variant: any) => ({
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        status: variant.status,
        attributeValues: variant.attributeValues.map((value: any) => ({
          attributeId: value.attributeId,
          optionId: value.optionId,
          textValue: value.textValue,
          numberValue: value.numberValue,
        })),
      })),
      images: dbProduct.images.map((image: any) => ({
        id: image.id,
        url: image.url,
        altText: image.altText,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      })),
      createdAt: dbProduct.createdAt.toISOString(),
      updatedAt: dbProduct.updatedAt.toISOString(),
    };
  }
}

export class DatabaseProductTypeRepository implements ProductTypeRepository {
  async findAll(): Promise<ProductType[]> {
    return await withRetry(async () => {
      const productTypes = await prisma.productType.findMany({
        where: { isActive: true },
        orderBy: { displayName: 'asc' },
      });

      return productTypes.map(pt => ({
        id: pt.id,
        name: pt.name,
        displayName: pt.displayName,
        description: pt.description ?? undefined,
        isActive: pt.isActive,
      }));
    });
  }

  async findById(id: string): Promise<ProductType | undefined> {
    const productType = await prisma.productType.findUnique({
      where: { id },
    });

    return productType ? {
      id: productType.id,
      name: productType.name,
      displayName: productType.displayName,
      description: productType.description ?? undefined,
      isActive: productType.isActive,
    } : undefined;
  }

  async findByName(name: string): Promise<ProductType | undefined> {
    const productType = await prisma.productType.findUnique({
      where: { name },
    });

    return productType ? {
      id: productType.id,
      name: productType.name,
      displayName: productType.displayName,
      description: productType.description ?? undefined,
      isActive: productType.isActive,
    } : undefined;
  }

  async create(productTypeData: Omit<ProductType, 'id'>): Promise<ProductType> {
    const productType = await prisma.productType.create({
      data: productTypeData,
    });

    return {
      id: productType.id,
      name: productType.name,
      displayName: productType.displayName,
      description: productType.description ?? undefined,
      isActive: productType.isActive,
    };
  }

  async update(id: string, productTypeData: Partial<ProductType>): Promise<ProductType> {
    const productType = await prisma.productType.update({
      where: { id },
      data: productTypeData,
    });

    return {
      id: productType.id,
      name: productType.name,
      displayName: productType.displayName,
      description: productType.description ?? undefined,
      isActive: productType.isActive,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.productType.delete({
      where: { id },
    });
  }

  async getAttributes(id: string): Promise<ProductAttribute[]> {
    const attributes = await prisma.productTypeAttribute.findMany({
      where: { productTypeId: id },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return attributes.map(attr => ({
      id: attr.id,
      name: attr.name,
      displayName: attr.displayName,
      type: attr.type as 'SELECT' | 'TEXT' | 'NUMBER',
      isRequired: attr.isRequired,
      sortOrder: attr.sortOrder,
      options: attr.options.map(option => ({
        id: option.id,
        value: option.value,
        displayName: option.displayName,
        sortOrder: option.sortOrder,
      })),
    }));
  }
}