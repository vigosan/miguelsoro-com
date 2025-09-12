import { Product, ProductType, ProductAttribute } from "@/domain/product";
import { ProductRepository, ProductTypeRepository } from "./ProductRepository";
import { createAdminClient } from "@/utils/supabase/server";

export class SupabaseProductTypeRepository implements ProductTypeRepository {
  private getClient() {
    return createAdminClient();
  }

  async findAll(): Promise<ProductType[]> {
    const supabase = this.getClient();
    
    const { data: productTypes, error } = await supabase
      .from('product_types')
      .select('*')
      .eq('isActive', true)
      .order('displayName', { ascending: true });

    if (error) {
      console.error('Error fetching product types:', error);
      throw new Error(`Failed to fetch product types: ${error.message}`);
    }

    return productTypes?.map(pt => ({
      id: pt.id,
      name: pt.name,
      displayName: pt.displayName,
      description: pt.description,
      isActive: pt.isActive,
    })) || [];
  }

  async findById(id: string): Promise<ProductType | undefined> {
    const supabase = this.getClient();
    
    const { data: productType, error } = await supabase
      .from('product_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return undefined;
      }
      console.error('Error fetching product type by id:', error);
      throw new Error(`Failed to fetch product type: ${error.message}`);
    }

    return productType ? {
      id: productType.id,
      name: productType.name,
      displayName: productType.displayName,
      description: productType.description,
      isActive: productType.isActive,
    } : undefined;
  }

  async findByName(name: string): Promise<ProductType | undefined> {
    const supabase = this.getClient();
    
    const { data: productType, error } = await supabase
      .from('product_types')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return undefined;
      }
      console.error('Error fetching product type by name:', error);
      throw new Error(`Failed to fetch product type: ${error.message}`);
    }

    return productType ? {
      id: productType.id,
      name: productType.name,
      displayName: productType.displayName,
      description: productType.description,
      isActive: productType.isActive,
    } : undefined;
  }

  async create(productTypeData: Omit<ProductType, 'id'>): Promise<ProductType> {
    const supabase = this.getClient();
    
    const { data: productType, error } = await supabase
      .from('product_types')
      .insert({
        name: productTypeData.name,
        displayName: productTypeData.displayName,
        description: productTypeData.description,
        isActive: productTypeData.isActive,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product type:', error);
      throw new Error(`Failed to create product type: ${error.message}`);
    }

    return {
      id: productType.id,
      name: productType.name,
      displayName: productType.displayName,
      description: productType.description,
      isActive: productType.isActive,
    };
  }

  async update(id: string, productTypeData: Partial<ProductType>): Promise<ProductType> {
    const supabase = this.getClient();
    
    const updateData: any = {};
    if (productTypeData.name !== undefined) updateData.name = productTypeData.name;
    if (productTypeData.displayName !== undefined) updateData.displayName = productTypeData.displayName;
    if (productTypeData.description !== undefined) updateData.description = productTypeData.description;
    if (productTypeData.isActive !== undefined) updateData.isActive = productTypeData.isActive;

    const { data: productType, error } = await supabase
      .from('product_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product type:', error);
      throw new Error(`Failed to update product type: ${error.message}`);
    }

    return {
      id: productType.id,
      name: productType.name,
      displayName: productType.displayName,
      description: productType.description,
      isActive: productType.isActive,
    };
  }

  async delete(id: string): Promise<void> {
    const supabase = this.getClient();
    
    const { error } = await supabase
      .from('product_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product type:', error);
      throw new Error(`Failed to delete product type: ${error.message}`);
    }
  }

  async getAttributes(id: string): Promise<ProductAttribute[]> {
    const supabase = this.getClient();
    
    const { data: attributes, error } = await supabase
      .from('product_type_attributes')
      .select(`
        *,
        attribute_options!inner(
          id,
          value,
          displayName,
          sortOrder,
          isActive
        )
      `)
      .eq('productTypeId', id)
      .eq('attribute_options.isActive', true)
      .order('sortOrder', { ascending: true });

    if (error) {
      console.error('Error fetching product type attributes:', error);
      throw new Error(`Failed to fetch attributes: ${error.message}`);
    }

    return attributes?.map(attr => ({
      id: attr.id,
      name: attr.name,
      displayName: attr.displayName,
      type: attr.type as 'SELECT' | 'TEXT' | 'NUMBER',
      isRequired: attr.isRequired,
      sortOrder: attr.sortOrder,
      options: (attr.attribute_options || [])
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((option: any) => ({
          id: option.id,
          value: option.value,
          displayName: option.displayName,
          sortOrder: option.sortOrder,
        })),
    })) || [];
  }
}

export class SupabaseProductRepository implements ProductRepository {
  private getClient() {
    return createAdminClient();
  }

  async findAll(): Promise<Product[]> {
    const supabase = this.getClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_types(
          id,
          name,
          displayName,
          description,
          isActive
        ),
        product_variants(
          id,
          sku,
          price,
          stock,
          status,
          product_variant_attribute_values(
            attributeId,
            optionId,
            textValue,
            numberValue
          )
        ),
        product_images(
          id,
          url,
          altText,
          sortOrder,
          isPrimary
        )
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return (products || []).map(this.mapToDomainProduct);
  }

  async findById(id: string): Promise<Product | undefined> {
    const supabase = this.getClient();
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_types(
          id,
          name,
          displayName,
          description,
          isActive
        ),
        product_variants(
          id,
          sku,
          price,
          stock,
          status,
          product_variant_attribute_values(
            attributeId,
            optionId,
            textValue,
            numberValue
          )
        ),
        product_images(
          id,
          url,
          altText,
          sortOrder,
          isPrimary
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return undefined;
      }
      console.error('Error fetching product by id:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return product ? this.mapToDomainProduct(product) : undefined;
  }

  async findBySlug(slug: string): Promise<Product | undefined> {
    const supabase = this.getClient();
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_types(
          id,
          name,
          displayName,
          description,
          isActive
        ),
        product_variants(
          id,
          sku,
          price,
          stock,
          status,
          product_variant_attribute_values(
            attributeId,
            optionId,
            textValue,
            numberValue
          )
        ),
        product_images(
          id,
          url,
          altText,
          sortOrder,
          isPrimary
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return undefined;
      }
      console.error('Error fetching product by slug:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return product ? this.mapToDomainProduct(product) : undefined;
  }

  async findByProductType(productTypeId: string): Promise<Product[]> {
    const supabase = this.getClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_types(
          id,
          name,
          displayName,
          description,
          isActive
        ),
        product_variants(
          id,
          sku,
          price,
          stock,
          status,
          product_variant_attribute_values(
            attributeId,
            optionId,
            textValue,
            numberValue
          )
        ),
        product_images(
          id,
          url,
          altText,
          sortOrder,
          isPrimary
        )
      `)
      .eq('productTypeId', productTypeId)
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching products by type:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return (products || []).map(this.mapToDomainProduct);
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
    const supabase = this.getClient();
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
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
        id: dbProduct.product_types.id,
        name: dbProduct.product_types.name,
        displayName: dbProduct.product_types.displayName,
        description: dbProduct.product_types.description,
        isActive: dbProduct.product_types.isActive,
      },
      variants: (dbProduct.product_variants || []).map((variant: any) => ({
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        status: variant.status,
        attributeValues: (variant.product_variant_attribute_values || []).map((value: any) => ({
          attributeId: value.attributeId,
          optionId: value.optionId,
          textValue: value.textValue,
          numberValue: value.numberValue,
        })),
      })),
      images: (dbProduct.product_images || [])
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((image: any) => ({
          id: image.id,
          url: image.url,
          altText: image.altText,
          sortOrder: image.sortOrder,
          isPrimary: image.isPrimary,
        })),
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  }
}