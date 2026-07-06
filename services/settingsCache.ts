const TTL_MS = 60_000;

// Single-row settings tables were queried on every checkout, cart-validate,
// and invoice request. Successful reads (including a legitimate "no settings
// yet" null) are cached briefly; failed loads are never cached so a transient
// DB error cannot stick, and writers must call invalidate() so admin changes
// apply immediately.
export function createSettingsCache<T>(load: () => Promise<T | null>) {
  let cached: { value: T | null; expiresAt: number } | null = null;

  return {
    async get(): Promise<T | null> {
      if (cached && Date.now() < cached.expiresAt) {
        return cached.value;
      }

      try {
        const value = await load();
        cached = { value, expiresAt: Date.now() + TTL_MS };
        return value;
      } catch (error) {
        console.error("Error loading settings:", error);
        return null;
      }
    },
    invalidate() {
      cached = null;
    },
  };
}
