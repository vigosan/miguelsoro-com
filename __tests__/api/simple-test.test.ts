import { describe, it, expect, beforeEach, vi } from "vitest";

// Create a simple mock for Supabase repositories
const mockOrderRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
};

// Mock the dependencies module
vi.mock("@/infra/dependencies", () => ({
  orderRepository: mockOrderRepository,
}));

describe("Simple API Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should work with basic mocking", () => {
    expect(mockOrderRepository.findById).toBeDefined();
    mockOrderRepository.findById.mockResolvedValue({ id: "test" });
    expect(mockOrderRepository.findById).toHaveBeenCalledTimes(0);
  });
});
