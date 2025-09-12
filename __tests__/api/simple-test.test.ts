import { describe, it, expect, beforeEach, vi } from 'vitest'

// Create a simple mock for prisma
const mockPrisma = {
  order: {
    findUnique: vi.fn(),
  }
}

// Mock the prisma module
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

describe('Simple API Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should work with basic mocking', () => {
    expect(mockPrisma.order.findUnique).toBeDefined()
    mockPrisma.order.findUnique.mockResolvedValue({ id: 'test' })
    expect(mockPrisma.order.findUnique).toHaveBeenCalledTimes(0)
  })
})