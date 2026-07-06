-- Sequential invoice numbering, required for legally valid Spanish invoices.
-- Additive and nullable: existing orders keep NULL until an invoice is issued.
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq;

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS "invoiceNumber" INTEGER UNIQUE,
    ADD COLUMN IF NOT EXISTS "invoicedAt" TIMESTAMP;

-- Idempotent and atomic: assigns the next number only on first call for an
-- order; later calls return the already-assigned number. COALESCE only
-- evaluates nextval() when the column is still NULL.
CREATE OR REPLACE FUNCTION assign_invoice_number(order_id TEXT)
RETURNS TABLE("invoiceNumber" INTEGER, "invoicedAt" TIMESTAMP) AS $$
    UPDATE orders
    SET "invoiceNumber" = COALESCE("invoiceNumber", nextval('invoice_number_seq')::INTEGER),
        "invoicedAt" = COALESCE("invoicedAt", now())
    WHERE id = order_id
    RETURNING "invoiceNumber", "invoicedAt";
$$ LANGUAGE sql;
