import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type GeneralSettingsForm = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  businessName: string;
  businessNif: string;
  businessAddress: string;
};

export type ShippingSettingsForm = {
  shippingCost: number; // euros
  freeShippingThreshold: number; // euros
};

export const settingsKeys = {
  all: ["admin-settings"] as const,
  general: () => [...settingsKeys.all, "general"] as const,
  shipping: () => [...settingsKeys.all, "shipping"] as const,
};

const GENERAL_DEFAULTS: GeneralSettingsForm = {
  siteName: "Miguel Soro - Arte Ciclista",
  siteDescription:
    "Obras de arte originales inspiradas en el mundo del ciclismo",
  contactEmail: "info@miguelsoro.com",
  businessName: "",
  businessNif: "",
  businessAddress: "",
};

export function useGeneralSettings() {
  return useQuery({
    queryKey: settingsKeys.general(),
    queryFn: async (): Promise<GeneralSettingsForm> => {
      const response = await fetch("/api/admin/general-settings");
      if (!response.ok) {
        throw new Error("Failed to fetch general settings");
      }
      const data = await response.json();
      return {
        siteName: data.siteName ?? GENERAL_DEFAULTS.siteName,
        siteDescription:
          data.siteDescription ?? GENERAL_DEFAULTS.siteDescription,
        contactEmail: data.contactEmail ?? GENERAL_DEFAULTS.contactEmail,
        businessName: data.businessName ?? "",
        businessNif: data.businessNif ?? "",
        businessAddress: data.businessAddress ?? "",
      };
    },
  });
}

export function useSaveGeneralSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: GeneralSettingsForm) => {
      const response = await fetch("/api/admin/general-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save settings");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.general() });
    },
  });
}

export function useShippingSettings() {
  return useQuery({
    queryKey: settingsKeys.shipping(),
    queryFn: async (): Promise<ShippingSettingsForm> => {
      const response = await fetch("/api/admin/shipping-settings");
      if (!response.ok) {
        throw new Error("Failed to fetch shipping settings");
      }
      const data = await response.json();
      return {
        shippingCost: data.standardRate / 100, // Convert cents to euros
        freeShippingThreshold: data.freeShippingThreshold / 100, // Convert cents to euros
      };
    },
  });
}

export function useSaveShippingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: ShippingSettingsForm) => {
      const response = await fetch("/api/admin/shipping-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standardRate: settings.shippingCost,
          freeShippingThreshold: settings.freeShippingThreshold,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.shipping() });
    },
  });
}
