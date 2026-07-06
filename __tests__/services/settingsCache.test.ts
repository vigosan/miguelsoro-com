// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createSettingsCache } from "@/services/settingsCache";

describe("createSettingsCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("serves repeated reads from memory (settings hit the DB on every checkout request)", async () => {
    const loader = vi.fn().mockResolvedValue({ standardRate: 500 });
    const cache = createSettingsCache(loader);

    expect(await cache.get()).toEqual({ standardRate: 500 });
    expect(await cache.get()).toEqual({ standardRate: 500 });

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("reloads after the TTL expires", async () => {
    const loader = vi.fn().mockResolvedValue({ standardRate: 500 });
    const cache = createSettingsCache(loader);

    await cache.get();
    vi.advanceTimersByTime(61_000);
    await cache.get();

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("reloads immediately after invalidation so admin saves apply at once", async () => {
    // Invoices read the seller's fiscal data through this cache: a stale
    // minute after saving would emit invoices with the old data.
    const loader = vi
      .fn()
      .mockResolvedValueOnce({ standardRate: 500 })
      .mockResolvedValueOnce({ standardRate: 700 });
    const cache = createSettingsCache(loader);

    expect(await cache.get()).toEqual({ standardRate: 500 });
    cache.invalidate();
    expect(await cache.get()).toEqual({ standardRate: 700 });
  });

  it("caches a legitimate null (no settings configured yet)", async () => {
    const loader = vi.fn().mockResolvedValue(null);
    const cache = createSettingsCache(loader);

    expect(await cache.get()).toBeNull();
    expect(await cache.get()).toBeNull();

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("never caches a failed load — a transient DB error must not stick for a minute", async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce({ standardRate: 500 });
    const cache = createSettingsCache(loader);

    expect(await cache.get()).toBeNull();
    expect(await cache.get()).toEqual({ standardRate: 500 });

    expect(loader).toHaveBeenCalledTimes(2);
  });
});
