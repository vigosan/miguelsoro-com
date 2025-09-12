import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ShippingSettings {
  id: string;
  standardRate: number; // in cents
  freeShippingThreshold: number; // in cents
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getShippingSettings(): Promise<ShippingSettings | null> {
  try {
    const settings = await prisma.shippingSettings.findFirst({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return settings;
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    return null;
  }
}

export async function createShippingSettings(data: {
  standardRate: number;
  freeShippingThreshold: number;
}): Promise<ShippingSettings> {
  await prisma.shippingSettings.updateMany({
    where: {
      isActive: true
    },
    data: {
      isActive: false
    }
  });

  return await prisma.shippingSettings.create({
    data: {
      ...data,
      isActive: true
    }
  });
}

export async function updateShippingSettings(
  id: string,
  data: {
    standardRate?: number;
    freeShippingThreshold?: number;
  }
): Promise<ShippingSettings | null> {
  try {
    return await prisma.shippingSettings.update({
      where: { id },
      data
    });
  } catch (error) {
    console.error('Error updating shipping settings:', error);
    return null;
  }
}

export function calculateShipping(subtotalCents: number, settings: ShippingSettings | null): number {
  if (!settings) {
    return 0;
  }

  return subtotalCents >= settings.freeShippingThreshold ? 0 : settings.standardRate;
}