const container = new Jimple();

// Database Provider
const databaseProvider = {
  register(container) {
    container.set("dbConfig", {
      host: "localhost",
      port: 5432,
      database: "myapp",
    });

    container.set("database", (c) => {
      const config = c.get("dbConfig");
      return {
        connect: () => console.log(`🗄️ Database connected: ${config.database}`),
        query: (sql) => console.log(`🔍 Query: ${sql}`),
      };
    });
  },
};

// Cache Provider
const cacheProvider = {
  register(container) {
    container.set("cacheConfig", {
      ttl: 3600,
      maxSize: 1000,
    });

    container.set("cache", (c) => {
      const config = c.get("cacheConfig");
      return {
        get: (key) => console.log(`📥 Cache GET: ${key} (TTL: ${config.ttl}s)`),
        set: (key, value) => console.log(`📤 Cache SET: ${key} = ${value}`),
        clear: () => console.log("🧹 Cache cleared"),
      };
    });
  },
};

// Logger Provider
const loggerProvider = {
  register(container) {
    container.set("logLevel", "info");

    container.set("logger", (c) => {
      const level = c.get("logLevel");
      return {
        info: (msg) => console.log(`ℹ️ [${level.toUpperCase()}] ${msg}`),
        error: (msg) => console.log(`❌ [ERROR] ${msg}`),
        debug: (msg) => console.log(`🐛 [DEBUG] ${msg}`),
      };
    });
  },
};

// Register all providers
console.log("📦 Registering multiple providers...");
container.register(databaseProvider);
container.register(cacheProvider);
container.register(loggerProvider);

// Use services from different providers
console.log("\n🚀 Testing services from multiple providers:");

const db = container.get("database");
db.connect();
db.query("SELECT * FROM users");

const cache = container.get("cache");
cache.set("user:1", "John Doe");
cache.get("user:1");

const logger = container.get("logger");
logger.info("Application started successfully");
logger.debug("All providers loaded");

console.log("\n📋 Registered services:", container.keys());
