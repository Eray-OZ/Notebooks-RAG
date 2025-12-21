// Simple in-memory cache with expiration
const cache = new Map();

const DEFAULT_TTL = 60 * 1000; // 60 seconds

export const cacheService = {
    get(key) {
        const item = cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            cache.delete(key);
            return null;
        }
        return item.data;
    },

    set(key, data, ttl = DEFAULT_TTL) {
        cache.set(key, {
            data,
            expiry: Date.now() + ttl
        });
    },

    invalidate(key) {
        cache.delete(key);
    },

    invalidatePattern(pattern) {
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
    },

    clear() {
        cache.clear();
    }
};

export default cacheService;
