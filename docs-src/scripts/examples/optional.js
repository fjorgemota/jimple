class RedisCache {
    constructor(config) {
        this.config = config;
    }
    get(key) {
        console.log(`Getting ${key} from Redis at ${this.config.host}:${this.config.port}`);
        return null;
    }
}

class MemoryCache {
    get(key) {
        console.log(`Getting ${key} from Memory Cache`);
        return null;
    }
}

const container = new Jimple();

container.set('cache', (c) => {
    if (c.has('redisConfig')) {
        return new RedisCache(c.get('redisConfig'));
    }
    return new MemoryCache(); // Fallback
});

// Uncomment the next line to simulate Redis configuration
// container.set('redisConfig', { host: 'localhost', port: 6379 });
const cache = container.get('cache');
const value = cache.get('myKey');
