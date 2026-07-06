-- Seller fiscal data shown on invoices, editable from the admin settings.
-- Additive and nullable: invoicing is blocked until the admin fills them in.
ALTER TABLE general_settings
    ADD COLUMN IF NOT EXISTS "businessName" VARCHAR(255),
    ADD COLUMN IF NOT EXISTS "businessNif" VARCHAR(50),
    ADD COLUMN IF NOT EXISTS "businessAddress" TEXT;
