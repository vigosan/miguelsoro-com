-- General site settings (site name, description, contact email).
-- Additive: does not modify existing tables. Column names use camelCase with
-- quoted identifiers to match how the app (shipping_settings pattern) reads them.
CREATE TABLE IF NOT EXISTS general_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "siteName" VARCHAR(255) NOT NULL DEFAULT 'Miguel Soro - Arte Ciclista',
    "siteDescription" TEXT NOT NULL DEFAULT '',
    "contactEmail" VARCHAR(255) NOT NULL DEFAULT 'info@miguelsoro.com',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one active settings row is expected at a time.
CREATE INDEX IF NOT EXISTS idx_general_settings_active
    ON general_settings("isActive", "createdAt" DESC);

-- Seed an initial active row so the app always has settings to read.
INSERT INTO general_settings ("siteName", "siteDescription", "contactEmail")
VALUES (
    'Miguel Soro - Arte Ciclista',
    'Obras de arte originales inspiradas en el mundo del ciclismo',
    'info@miguelsoro.com'
);
