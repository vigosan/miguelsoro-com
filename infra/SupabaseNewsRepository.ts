import {
  News,
  CreateNewsData,
  UpdateNewsData,
  generateSlug,
} from "@/domain/news";
import { createClient } from "@supabase/supabase-js";

export class SupabaseNewsRepository {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private mapDbToNews(dbRecord: any): News {
    return {
      id: dbRecord.id,
      title: dbRecord.title,
      slug: dbRecord.slug,
      description: dbRecord.description,
      type: dbRecord.type,
      date: dbRecord.date,
      location: dbRecord.location,
      externalUrl: dbRecord.external_url,
      published: dbRecord.published,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }

  private mapNewsToDb(news: Partial<News> & { slug?: string }): any {
    const dbRecord: any = {};
    if (news.title !== undefined) dbRecord.title = news.title;
    if (news.slug !== undefined) dbRecord.slug = news.slug;
    if (news.description !== undefined) dbRecord.description = news.description;
    if (news.type !== undefined) dbRecord.type = news.type;
    if (news.date !== undefined) dbRecord.date = news.date;
    if (news.location !== undefined) dbRecord.location = news.location;
    if (news.externalUrl !== undefined)
      dbRecord.external_url = news.externalUrl;
    if (news.published !== undefined) dbRecord.published = news.published;
    return dbRecord;
  }

  async findAll(): Promise<News[]> {
    const { data, error } = await this.supabase
      .from("news")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapDbToNews);
  }

  async findById(id: string): Promise<News | null> {
    const { data, error } = await this.supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw new Error(error.message);
    return data ? this.mapDbToNews(data) : null;
  }

  async findBySlug(slug: string): Promise<News | null> {
    const { data, error } = await this.supabase
      .from("news")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error && error.code !== "PGRST116") throw new Error(error.message);
    return data ? this.mapDbToNews(data) : null;
  }

  async findPublished(): Promise<News[]> {
    const { data, error } = await this.supabase
      .from("news")
      .select("*")
      .eq("published", true)
      .order("date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapDbToNews);
  }

  async create(data: CreateNewsData): Promise<News> {
    const slug = generateSlug(data.title);
    const dbData = this.mapNewsToDb({ ...data, slug });

    const { data: news, error } = await this.supabase
      .from("news")
      .insert(dbData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapDbToNews(news);
  }

  async update(id: string, data: UpdateNewsData): Promise<News | null> {
    // Create update object with potential slug
    const updateData: UpdateNewsData & { slug?: string } = { ...data };

    // Regenerate slug if title changed
    if (data.title) {
      updateData.slug = generateSlug(data.title);
    }

    // Map to database format
    const dbData = this.mapNewsToDb(updateData);

    console.log("Supabase update data:", dbData);
    console.log("Supabase update ID:", id);

    const { data: news, error } = await this.supabase
      .from("news")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw new Error(`Update failed: ${error.message} (code: ${error.code})`);
    }

    return news ? this.mapDbToNews(news) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("news").delete().eq("id", id);

    if (error) throw new Error(error.message);
    return true;
  }
}
