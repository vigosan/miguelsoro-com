// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

const mockRepository = vi.hoisted(() => ({
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@/infra/SupabaseNewsRepository", () => ({
  SupabaseNewsRepository: function () {
    return mockRepository;
  },
}));

import handler from "@/pages/api/news/[id]";
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

describe("/api/news/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a single news item to anonymous visitors", async () => {
    const req = createMockRequest("GET", undefined, { id: "news-1" });
    const res = createMockResponse();

    mockRepository.findById.mockResolvedValue(mockNews);

    await handler(req as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockNews);
  });

  it("rejects anonymous updates (site content is admin-only)", async () => {
    const req = createMockRequest(
      "PUT",
      { title: "defaced" },
      { id: "news-1" },
    );
    const res = createMockResponse();

    await handler(req as any, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it("rejects anonymous deletions", async () => {
    const req = createMockRequest("DELETE", undefined, { id: "news-1" });
    const res = createMockResponse();

    await handler(req as any, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it("updates a news item for an authenticated admin", async () => {
    const req = await createAuthedRequest(
      "PUT",
      { title: "Nueva exposición" },
      { id: "news-1" },
    );
    const res = createMockResponse();

    mockRepository.update.mockResolvedValue(mockNews);

    await handler(req as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockNews);
  });

  it("deletes a news item for an authenticated admin", async () => {
    const req = await createAuthedRequest("DELETE", undefined, {
      id: "news-1",
    });
    const res = createMockResponse();

    mockRepository.delete.mockResolvedValue(true);

    await handler(req as any, res);

    expect(res.status).toHaveBeenCalledWith(204);
  });
});
