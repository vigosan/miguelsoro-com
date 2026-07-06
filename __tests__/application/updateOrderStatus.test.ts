// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateOrderStatus } from "@/application/orderUseCases";
import type { OrderRepository } from "@/infra/OrderRepository";

const createMockRepository = () =>
  ({
    updateStatus: vi.fn().mockResolvedValue({ id: "order-123" }),
  }) as unknown as OrderRepository;

describe("UpdateOrderStatus", () => {
  let repository: OrderRepository;
  let useCase: UpdateOrderStatus;

  beforeEach(() => {
    repository = createMockRepository();
    useCase = new UpdateOrderStatus(repository);
  });

  it("accepts PROCESSING so the admin 'Marcar como Procesado' button works", async () => {
    await useCase.execute("order-123", "PROCESSING");

    expect(repository.updateStatus).toHaveBeenCalledWith(
      "order-123",
      "PROCESSING",
    );
  });

  it.each(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"])(
    "accepts %s",
    async (status) => {
      await useCase.execute("order-123", status);

      expect(repository.updateStatus).toHaveBeenCalledWith(
        "order-123",
        status,
      );
    },
  );

  it("rejects unknown statuses so corrupt values never reach the database", async () => {
    await expect(useCase.execute("order-123", "BOGUS")).rejects.toThrow(
      "Invalid status",
    );
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it("rejects a missing status", async () => {
    await expect(useCase.execute("order-123", "")).rejects.toThrow(
      "Status is required",
    );
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });
});
