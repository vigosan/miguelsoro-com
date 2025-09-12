import { Picture, getPictureStatus } from "@/domain/picture";
import { PictureRepository } from "./PictureRepository";
import { createAdminClient } from "@/utils/supabase/server";

export class DatabasePictureRepository implements PictureRepository {
  private getClient() {
    return createAdminClient();
  }

  async findAll(filters?: {
    productType?: string;
    inStock?: boolean;
    status?: 'AVAILABLE' | 'NOT_AVAILABLE';
  }): Promise<Picture[]> {
    const supabase = this.getClient();
    
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images!inner(
          url,
          isPrimary
        ),
        product_types(
          id,
          displayName
        ),
        product_variants(
          id,
          price,
          stock
        )
      `)
      .eq('isActive', true)
      .eq('product_images.isPrimary', true);

    // Filter by product type
    if (filters?.productType) {
      query = query.eq('product_types.displayName', filters.productType);
    }

    const { data: products, error } = await query
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching pictures:', error);
      throw new Error(`Failed to fetch pictures: ${error.message}`);
    }

    if (!products) return [];

    let results = products.map(product => this.mapToDomainPicture(product));

    // Filter by stock availability (client-side filter)
    if (filters?.inStock !== undefined) {
      results = results.filter(picture => {
        if (filters.inStock) {
          return picture.stock > 0;
        } else {
          return picture.stock === 0;
        }
      });
    }

    // Filter by status (client-side filter)
    if (filters?.status) {
      results = results.filter(picture => getPictureStatus(picture) === filters.status);
    }

    return results;
  }

  async getPictureBySlug(slug: string): Promise<Picture | undefined> {
    const supabase = this.getClient();
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images!inner(
          url,
          isPrimary
        ),
        product_types(
          id,
          displayName
        ),
        product_variants(
          id,
          price,
          stock
        )
      `)
      .eq('slug', slug)
      .eq('product_images.isPrimary', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return undefined;
      }
      console.error('Error fetching picture by slug:', error);
      throw new Error(`Failed to fetch picture: ${error.message}`);
    }

    return product ? this.mapToDomainPicture(product) : undefined;
  }

  async getPictureById(id: string): Promise<Picture | undefined> {
    const supabase = this.getClient();
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images!inner(
          url,
          isPrimary
        ),
        product_types(
          id,
          displayName
        ),
        product_variants(
          id,
          price,
          stock
        )
      `)
      .eq('id', id)
      .eq('product_images.isPrimary', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return undefined;
      }
      console.error('Error fetching picture by id:', error);
      throw new Error(`Failed to fetch picture: ${error.message}`);
    }

    return product ? this.mapToDomainPicture(product) : undefined;
  }

  private mapToDomainPicture(dbProduct: any): Picture {
    const variant = dbProduct.product_variants?.[0];
    const image = dbProduct.product_images?.[0];
    
    const priceInCents = variant ? variant.price : dbProduct.basePrice;
    const priceInEuros = priceInCents ? priceInCents / 100 : 0; // Convert cents to euros

    return {
      id: dbProduct.id,
      title: dbProduct.title,
      description: dbProduct.description || '',
      price: priceInEuros, // Price in euros
      size: this.extractSizeFromTitle(dbProduct.title) || '120x90', // Default size
      slug: dbProduct.slug,
      imageUrl: image ? image.url : `/pictures/${dbProduct.id}.webp`, // Fallback to convention
      productTypeId: dbProduct.productTypeId,
      productTypeName: dbProduct.product_types?.displayName || 'Cuadros Originales',
      stock: variant ? variant.stock : 1,
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt
    };
  }

  async create(pictureData: Omit<Picture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Picture> {
    throw new Error('Picture creation not implemented yet - requires complex Product/Variant creation');
  }

  async update(id: string, pictureData: any): Promise<Picture> {
    const supabase = this.getClient();
    const { title, description, price, slug, stock, productTypeId, imageUrl } = pictureData;
    
    // Update product
    const productUpdateData: any = {};
    if (title) productUpdateData.title = title;
    if (description !== undefined) productUpdateData.description = description;
    if (price) productUpdateData.basePrice = Math.round(price * 100); // Convert euros to cents
    if (slug) productUpdateData.slug = slug;
    if (productTypeId) productUpdateData.productTypeId = productTypeId;

    if (Object.keys(productUpdateData).length > 0) {
      const { error } = await supabase
        .from('products')
        .update(productUpdateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        throw new Error(`Failed to update product: ${error.message}`);
      }
    }

    // Update or create product image if provided
    if (imageUrl) {
      // First, check for existing primary image
      const { data: existingImage } = await supabase
        .from('product_images')
        .select('id')
        .eq('productId', id)
        .eq('isPrimary', true)
        .single();

      if (existingImage) {
        const { error } = await supabase
          .from('product_images')
          .update({ url: imageUrl })
          .eq('id', existingImage.id);

        if (error) {
          console.error('Error updating product image:', error);
          throw new Error(`Failed to update image: ${error.message}`);
        }
      } else {
        const { error } = await supabase
          .from('product_images')
          .insert({
            productId: id,
            url: imageUrl,
            isPrimary: true,
            sortOrder: 0
          });

        if (error) {
          console.error('Error creating product image:', error);
          throw new Error(`Failed to create image: ${error.message}`);
        }
      }
    }

    // Update variant price and stock
    const variantUpdateData: any = {};
    if (price) variantUpdateData.price = Math.round(price * 100); // Convert euros to cents
    if (stock !== undefined) variantUpdateData.stock = stock;

    if (Object.keys(variantUpdateData).length > 0) {
      const { error } = await supabase
        .from('product_variants')
        .update(variantUpdateData)
        .eq('productId', id);

      if (error) {
        console.error('Error updating product variant:', error);
        throw new Error(`Failed to update variant: ${error.message}`);
      }
    }

    // Return updated picture
    const updatedPicture = await this.getPictureById(id);
    if (!updatedPicture) {
      throw new Error('Picture not found after update');
    }
    
    return updatedPicture;
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

  // Helper method to extract size from title (e.g., "Obra 120x90" -> "120x90")
  private extractSizeFromTitle(title: string): string | null {
    const sizeMatch = title.match(/(\d+)x(\d+)/);
    return sizeMatch ? sizeMatch[0] : null;
  }
}