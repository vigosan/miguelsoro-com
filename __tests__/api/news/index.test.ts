// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

const mockRepository = vi.hoisted(() => ({
  findAll: vi.fn(),
  findPublished: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/infra/SupabaseNewsRepository", () => ({
  SupabaseNewsRepository: function () {
    return mockRepository;
  },
}));

import handler from "@/pages/api/news/index";
import {
  createMockRequest,
  createAuthedRequest,
  createMockResponse,
} from "../simple-helpers";

const mockNews = {
  id: "news-1",
  title: "Exposición en Valencia",
  published: true,
};

describe("/api/news", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns published news to anonymous visitors", async () => {
      const req = createMockRequest("GET");
      const res = createMockResponse();

      mockRepository.findPublished.mockResolvedValue([mockNews]);

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockNews]);
    });

    it("hides unpublished drafts from anonymous visitors", async () => {
      const req = createMockRequest("GET", undefined, { all: "true" });
      const res = createMockResponse();

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });

    it("returns all news including drafts to an authenticated admin", async () => {
      const req = await createAuthedRequest("GET", undefined, { all: "true" });
      const res = createMockResponse();

      mockRepository.findAll.mockResolvedValue([mockNews]);

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("POST", () => {
    it("rejects anonymous creation attempts (site content is admin-only)", async () => {
      const req = createMockRequest("POST", { title: "spam" });
      const res = createMockResponse();

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("creates a news item for an authenticated admin", async () => {
      const req = await createAuthedRequest("POST", {
        title: "Exposición en Valencia",
      });
      const res = createMockResponse();

      mockRepository.create.mockResolvedValue(mockNews);

      await handler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockNews);
    });
  });
});
