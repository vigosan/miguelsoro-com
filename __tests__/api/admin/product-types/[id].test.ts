// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

const mockProductTypeRepository = vi.hoisted(() => ({
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

const mockProductRepository = vi.hoisted(() => ({
  findByProductType: vi.fn(),
}));

vi.mock("@/infra/DatabaseProductRepository", () => ({
  DatabaseProductTypeRepository: function () {
    return mockProductTypeRepository;
  },
  DatabaseProductRepository: function () {
    return mockProductRepository;
  },
}));

import handler from "@/pages/api/admin/product-types/[id]";
import {
  createMockRequest,
  createAuthedRequest,
  createMockResponse,
} from "../../simple-helpers";

const existingType = {
  id: "type-1",
  name: "reproducciones",
  displayName: "Reproducciones",
  description: "Láminas de alta calidad",
  isActive: true,
};

describe("/api/admin/product-types/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PUT", () => {
    it("requires an admin session", async () => {
      const req = createMockRequest(
        "PUT",
        { displayName: "Nuevo" },
        { id: "type-1" },
      );
      const res = createMockResponse();

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockProductTypeRepository.update).not.toHaveBeenCalled();
    });

    it("updates the existing type in place so editing never duplicates it", async () => {
      const req = await createAuthedRequest(
        "PUT",
        { displayName: "Reproducciones Premium", description: "Actualizada" },
        { id: "type-1" },
      );
      const res = createMockResponse();

      mockProductTypeRepository.findById.mockResolvedValue(existingType);
      mockProductTypeRepository.update.mockResolvedValue({
        ...existingType,
        displayName: "Reproducciones Premium",
        description: "Actualizada",
      });

      await handler(req as any, res);

      expect(mockProductTypeRepository.update).toHaveBeenCalledWith("type-1", {
        displayName: "Reproducciones Premium",
        description: "Actualizada",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        productType: expect.objectContaining({
          id: "type-1",
          displayName: "Reproducciones Premium",
        }),
      });
    });

    it("keeps the internal name stable when renaming (products reference it)", async () => {
      const req = await createAuthedRequest(
        "PUT",
        { displayName: "Otro Nombre Distinto", description: "" },
        { id: "type-1" },
      );
      const res = createMockResponse();

      mockProductTypeRepository.findById.mockResolvedValue(existingType);
      mockProductTypeRepository.update.mockResolvedValue(existingType);

      await handler(req as any, res);

      const updatePayload = mockProductTypeRepository.update.mock.calls[0][1];
      expect(updatePayload).not.toHaveProperty("name");
    });

    it("rejects an empty display name", async () => {
      const req = await createAuthedRequest(
        "PUT",
        { displayName: "   ", description: "" },
        { id: "type-1" },
      );
      const res = createMockResponse();

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockProductTypeRepository.update).not.toHaveBeenCalled();
    });

    it("returns 404 when the type does not exist", async () => {
      const req = await createAuthedRequest(
        "PUT",
        { displayName: "Nuevo" },
        { id: "missing" },
      );
      const res = createMockResponse();

      mockProductTypeRepository.findById.mockResolvedValue(undefined);

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(mockProductTypeRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE", () => {
    it("still refuses to delete a type used by products", async () => {
      const req = await createAuthedRequest("DELETE", undefined, {
        id: "type-1",
      });
      const res = createMockResponse();

      mockProductTypeRepository.findById.mockResolvedValue(existingType);
      mockProductRepository.findByProductType.mockResolvedValue([
        { id: "product-1" },
      ]);

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(mockProductTypeRepository.delete).not.toHaveBeenCalled();
    });
  });
});
