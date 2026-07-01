import React from "react";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Provide a stable secret so admin auth (JWT) works in tests.
process.env.AUTH_SECRET =
  process.env.AUTH_SECRET || "test-secret-not-for-production-use-0123456789";

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/router", () => ({
  useRouter: () => ({
    route: "/",
    pathname: "/",
    query: {},
    asPath: "/",
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock Next.js image
vi.mock("next/image", () => ({
  default: (props: any) => React.createElement("img", props),
}));

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Set up global test environment (only in a browser-like environment)
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "";
  thresholds = [];
}
global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;
