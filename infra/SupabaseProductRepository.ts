import { ProductType, ProductAttribute } from "@/domain/product";
import { ProductTypeRepository } from "./ProductRepository";
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