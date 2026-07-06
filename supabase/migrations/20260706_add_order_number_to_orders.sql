-- Short customer-facing order reference (e.g. MS-7KQ2M4) shown in emails and
-- the confirmation page instead of the internal UUID, which stays as the
-- primary key and as the unguessable token in order-lookup URLs.
-- Additive and nullable: orders created before this migration keep NULL and
-- the UI falls back to a short tail of the UUID.
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS "orderNumber" TEXT UNIQUE;
