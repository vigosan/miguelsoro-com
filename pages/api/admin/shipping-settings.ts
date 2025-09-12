import type { NextApiRequest, NextApiResponse } from 'next';
import { getShippingSettings, createShippingSettings, updateShippingSettings } from '@/services/shippingSettings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const settings = await getShippingSettings();
      
      // Return default values if no settings found
      if (!settings) {
        return res.status(200).json({
          standardRate: 0,
          freeShippingThreshold: 0,
          isActive: true
        });
      }

      res.status(200).json({
        standardRate: settings.standardRate,
        freeShippingThreshold: settings.freeShippingThreshold,
        isActive: settings.isActive
      });
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { standardRate, freeShippingThreshold } = req.body;

      // Validate input
      if (typeof standardRate !== 'number' || typeof freeShippingThreshold !== 'number') {
        return res.status(400).json({ error: 'Invalid input. Both values must be numbers.' });
      }

      if (standardRate < 0 || freeShippingThreshold < 0) {
        return res.status(400).json({ error: 'Values cannot be negative.' });
      }

      // Convert euros to cents
      const standardRateCents = Math.round(standardRate * 100);
      const freeShippingThresholdCents = Math.round(freeShippingThreshold * 100);

      // Check if settings exist
      const existingSettings = await getShippingSettings();
      
      let settings;
      if (existingSettings) {
        // Update existing settings
        settings = await updateShippingSettings(existingSettings.id, {
          standardRate: standardRateCents,
          freeShippingThreshold: freeShippingThresholdCents
        });
      } else {
        // Create new settings
        settings = await createShippingSettings({
          standardRate: standardRateCents,
          freeShippingThreshold: freeShippingThresholdCents
        });
      }

      if (!settings) {
        return res.status(500).json({ error: 'Failed to save settings' });
      }

      res.status(200).json({
        standardRate: settings.standardRate,
        freeShippingThreshold: settings.freeShippingThreshold,
        isActive: settings.isActive
      });
    } catch (error) {
      console.error('Error saving shipping settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}