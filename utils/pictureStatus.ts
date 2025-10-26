// Simplified status system - now we only use stock to determine availability
// This file provides constants for the admin interface but the actual status
// is computed from stock using getPictureStatus() from domain/picture.ts

export const statusColors = {
  AVAILABLE: "bg-green-100 text-green-800",
  NOT_AVAILABLE: "bg-gray-100 text-gray-800",
} as const;

export const statusLabels = {
  AVAILABLE: "Disponible",
  NOT_AVAILABLE: "No disponible",
} as const;

// Note: These are only used for display purposes in admin
// The actual status is computed from stock field
export const adminStatusOptions = [
  {
    value: "AVAILABLE",
    label: "Disponible",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "NOT_AVAILABLE",
    label: "No disponible",
    color: "bg-gray-100 text-gray-800",
  },
];
