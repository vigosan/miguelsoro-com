// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  HandleWebhookOrderApproved,
  HandleWebhookPaymentDenied,
} from "@/application/orderUseCases";
import type { OrderRepository } from "@/infra/OrderRepository";

const createMockRepository = () =>
  ({
    updateManyByPayPalId: vi.fn().mockResolvedValue(undefined),
  }) as unknown as OrderRepository;

describe("HandleWebhookOrderApproved", () => {
  let repository: OrderRepository;

  beforeEach(() => {
    repository = createMockRepository();
  });

  it("only promotes PENDING orders so a late APPROVED webhook cannot downgrade a PAID order", async () => {
    // PayPal delivers webhooks out of order: APPROVED arriving after
    // PAYMENT.CAPTURE.COMPLETED must not turn a paid (refundable, counted
    // as revenue) order back into PROCESSING.
    const useCase = new HandleWebhookOrderApproved(repository);

    await useCase.execute("paypal-123");

    expect(repository.updateManyByPayPalId).toHaveBeenCalledWith(
      "paypal-123",
      "PROCESSING",
      ["PENDING"],
    );
  });
});

describe("HandleWebhookPaymentDenied", () => {
  let repository: OrderRepository;

  beforeEach(() => {
    repository = createMockRepository();
  });

  it("never cancels an order that was already paid or handled", async () => {
    const useCase = new HandleWebhookPaymentDenied(repository);

    await useCase.execute("paypal-123");

    expect(repository.updateManyByPayPalId).toHaveBeenCalledWith(
      "paypal-123",
      "CANCELLED",
      ["PENDING", "PROCESSING"],
    );
  });
});
