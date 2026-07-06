-- Store the PayPal capture id so paid orders can be refunded later.
-- Additive and nullable: existing orders keep NULL and are unaffected.
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS "captureId" VARCHAR(255);
