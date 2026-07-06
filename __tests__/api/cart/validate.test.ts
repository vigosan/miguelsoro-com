// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/infra/dependencies", () => ({
  productVariantRepository: {
    findByIds: vi.fn(),
    findAvailableByIds: vi.fn(),
  },
}));

vi.mock("@/services/databaseShippingSettings", () => ({
  getShippingSettings: vi.fn(),
}));

import handler from "@/pages/api/cart/validate";
import { productVariantRepository } from "@/infra/dependencies";
import { getShippingSettings } from "@/services/databaseShippingSettings";
import {
  createMockRequest,
  createMockResponse,
  mockVariant,
} from "../simple-helpers";

const mockFindByIds = vi.mocked(productVariantRepository.findByIds);
const mockFindAvailableByIds = vi.mocked(
  productVariantRepository.findAvailableByIds,
);
const mockGetShippingSettings = vi.mocked(getShippingSettings);

describe("/api/cart/validate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindByIds.mockResolvedValue([mockVariant] as any);
    mockGetShippingSettings.mockResolvedValue(null);
  });

  it("returns the current variant state and shipping settings", async () => {
    const req = createMockRequest("POST", { variantIds: ["variant-1"] });
    const res = createMockResponse();

    await handler(req as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      variants: [
        expect.objectContaining({ id: "variant-1", price: 2000, stock: 5 }),
      ],
      shippingSettings: { standardRate: 0, freeShippingThreshold: 0 },
    });
  });

  it("runs a single variant query — the availability filter is applied client-side from the full list", async () => {
    // This endpoint fires on every cart change plus a 30s poll; the second
    // multi-join query was never read and doubled the DB cost for nothing.
    const req = createMockRequest("POST", { variantIds: ["variant-1"] });
    const res = createMockResponse();

    await handler(req as any, res);

    expect(mockFindByIds).toHaveBeenCalledWith(["variant-1"]);
    expect(mockFindAvailableByIds).not.toHaveBeenCalled();
  });

  it("caps the number of variant ids a single request may validate", async () => {
    const req = createMockRequest("POST", {
      variantIds: Array.from({ length: 101 }, (_, i) => `variant-${i}`),
    });
    const res = createMockResponse();

    await handler(req as any, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockFindByIds).not.toHaveBeenCalled();
  });
});
