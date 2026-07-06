import { createAdminClient } from "@/utils/supabase/server";
import { createSettingsCache } from "@/services/settingsCache";

export interface GeneralSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  businessName: string | null;
  businessNif: string | null;
  businessAddress: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchGeneralSettings(): Promise<GeneralSettings | null> {
  const supabase = createAdminClient();

  const { data: settings, error } = await supabase
    .from("general_settings")
    .select("*")
    .eq("isActive", true)
    .order("createdAt", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch general settings: ${error.message}`);
  }

  return settings
    ? {
        id: settings.id,
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        contactEmail: settings.contactEmail,
        businessName: settings.businessName,
        businessNif: settings.businessNif,
        businessAddress: settings.businessAddress,
        isActive: settings.isActive,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      }
    : null;
}

const generalSettingsCache = createSettingsCache(fetchGeneralSettings);

export async function getGeneralSettings(): Promise<GeneralSettings | null> {
  return generalSettingsCache.get();
}

export async function saveGeneralSettings(data: {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  businessName?: string | null;
  businessNif?: string | null;
  businessAddress?: string | null;
}): Promise<GeneralSettings> {
  const supabase = createAdminClient();

  // Deactivate previous settings so only the latest row is active.
  await supabase
    .from("general_settings")
    .update({ isActive: false })
    .eq("isActive", true);

  const { data: settings, error } = await supabase
    .from("general_settings")
    .insert({
      siteName: data.siteName,
      siteDescription: data.siteDescription,
      contactEmail: data.contactEmail,
      businessName: data.businessName ?? null,
      businessNif: data.businessNif ?? null,
      businessAddress: data.businessAddress ?? null,
      isActive: true,
    })
    .select()
    .single();

  // The deactivate + insert pair may have changed rows even on failure
  generalSettingsCache.invalidate();

  if (error) {
    console.error("Error saving general settings:", error);
    throw new Error(`Failed to save general settings: ${error.message}`);
  }

  return {
    id: settings.id,
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    contactEmail: settings.contactEmail,
    businessName: settings.businessName,
    businessNif: settings.businessNif,
    businessAddress: settings.businessAddress,
    isActive: settings.isActive,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}
