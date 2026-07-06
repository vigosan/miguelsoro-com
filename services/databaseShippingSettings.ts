import { createAdminClient } from "@/utils/supabase/server";
import { createSettingsCache } from "@/services/settingsCache";

export interface ShippingSettings {
  id: string;
  standardRate: number; // in cents
  freeShippingThreshold: number; // in cents
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchShippingSettings(): Promise<ShippingSettings | null> {
  const supabase = createAdminClient();

  const { data: settings, error } = await supabase
    .from("shipping_settings")
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
    throw new Error(`Failed to fetch shipping settings: ${error.message}`);
  }

  return settings
    ? {
        id: settings.id,
        standardRate: settings.standardRate,
        freeShippingThreshold: settings.freeShippingThreshold,
        isActive: settings.isActive,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      }
    : null;
}

const shippingSettingsCache = createSettingsCache(fetchShippingSettings);

export async function getShippingSettings(): Promise<ShippingSettings | null> {
  return shippingSettingsCache.get();
}

export async function createShippingSettings(data: {
  standardRate: number;
  freeShippingThreshold: number;
}): Promise<ShippingSettings> {
  const supabase = createAdminClient();

  // First deactivate existing settings
  await supabase
    .from("shipping_settings")
    .update({ isActive: false })
    .eq("isActive", true);

  // Create new settings
  const { data: settings, error } = await supabase
    .from("shipping_settings")
    .insert({
      standardRate: data.standardRate,
      freeShippingThreshold: data.freeShippingThreshold,
      isActive: true,
    })
    .select()
    .single();

  // The deactivate + insert pair may have changed rows even on failure
  shippingSettingsCache.invalidate();

  if (error) {
    console.error("Error creating shipping settings:", error);
    throw new Error(`Failed to create shipping settings: ${error.message}`);
  }

  return {
    id: settings.id,
    standardRate: settings.standardRate,
    freeShippingThreshold: settings.freeShippingThreshold,
    isActive: settings.isActive,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

export async function updateShippingSettings(
  id: string,
  data: {
    standardRate?: number;
    freeShippingThreshold?: number;
  },
): Promise<ShippingSettings | null> {
  try {
    const supabase = createAdminClient();

    const { data: settings, error } = await supabase
      .from("shipping_settings")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    shippingSettingsCache.invalidate();

    if (error) {
      console.error("Error updating shipping settings:", error);
      return null;
    }

    return {
      id: settings.id,
      standardRate: settings.standardRate,
      freeShippingThreshold: settings.freeShippingThreshold,
      isActive: settings.isActive,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  } catch (error) {
    console.error("Error updating shipping settings:", error);
    return null;
  }
}

export function calculateShipping(
  subtotalCents: number,
  settings: ShippingSettings | null,
): number {
  if (!settings) {
    return 0;
  }

  return settings.freeShippingThreshold > 0 &&
    subtotalCents >= settings.freeShippingThreshold
    ? 0
    : settings.standardRate;
}
