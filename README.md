# Jimple

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/fjorgemota/jimple/test.yml)
[![npm version](https://img.shields.io/npm/v/jimple.svg)](http://npmjs.org/package/jimple/)
[![npm downloads](https://img.shields.io/npm/dt/jimple.svg)](http://npmjs.org/package/jimple/)
[![node version](https://img.shields.io/node/v/jimple.svg)](http://npmjs.org/package/jimple)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/jimple/badge)](https://www.jsdelivr.com/package/npm/jimple)

**Jimple** is a lightweight and powerful dependency injection container for JavaScript and TypeScript, built for **Node.js and the browser**. Inspired by [Pimple](https://github.com/silexphp/Pimple/), it brings clean, flexible dependency management to modern JavaScript projects — with zero dependencies and a minimal API.

## Table of Contents

- [Features](#features)
- [Why Dependency Injection?](#why-dependency-injection)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
  - [Services](#services)
  - [Parameters](#parameters)
  - [Factory Services](#factory-services)
- [Advanced Features](#advanced-features)
  - [Protecting Functions](#protecting-functions)
  - [Extending Services](#extending-services)
  - [Optional Dependencies & Defaults](#optional-dependencies--defaults)
  - [Raw Service Access](#raw-service-access)
- [ES6 Proxy Mode](#es6-proxy-mode)
- [TypeScript Support](#typescript-support)
- [Modular Configuration with Providers](#modular-configuration-with-providers)
- [API Reference](#api-reference)
- [Real-World Example](#real-world-example)
- [More Examples](#more-examples)
- [Extending Jimple](#extending-jimple)
- [Performance Tips](#performance-tips)
- [Migration from Other DI Containers](#migration-from-other-di-containers)
- [Documentation](#documentation)

## Features

✅ **Lightweight** - ~1KB minified and gzipped  
✅ **Zero dependencies** - No external dependencies in Node.js  
✅ **Universal** - Works in Node.js and browsers  
✅ **TypeScript** - Fully typed with excellent IDE support  
✅ **ES6 Proxy support** - Modern syntax with property access  
✅ **Extensible** - Easy to extend and customize  
✅ **Well tested** - 100% code coverage  
✅ **Stable API** - Mature, stable API you can depend on

## Why Dependency Injection?

Dependency injection helps you write more maintainable, testable code by:

- **Decoupling components** - Services don't need to know how their dependencies are created
- **Improving testability** - Easy to swap dependencies with mocks during testing
- **Managing complexity** - Centralized configuration of how objects are wired together
- **Lazy loading** - Services are only created when needed
- **Singleton by default**: Same instance returned on subsequent calls
- **Dependency management**: Services can depend on other services

## Quick Start

```bash
npm install jimple@2.0.0-beta.4
```

```js
import Jimple from "jimple";

// Create container
const container = new Jimple();

// Define a simple service
container.set("logger", (c) => {
  return {
    log: (msg) => console.log(`[${new Date().toISOString()}] ${msg}`),
  };
});

// Define a service that depends on another
container.set("userService", (c) => {
  const logger = c.get("logger");
  return {
    createUser: (name) => {
      logger.log(`Creating user: ${name}`);
      return { id: Math.random(), name };
    },
  };
});

// Use your services
const userService = container.get("userService");
const user = userService.createUser("Alice");
```

## Installation

### npm

```bash
npm install jimple
```

### CDN (Browser)

```html
<script src="https://cdn.jsdelivr.net/npm/jimple@2.0.0-beta.4/dist/Jimple.umd.js"></script>
```

### Import Methods

**ES6 Modules**

```js
import Jimple from "jimple";
```

**CommonJS**

```js
const Jimple = require("jimple");
```

**AMD**

```js
define(["jimple"], function (Jimple) {
  // Your code here
});
```

## Core Concepts

### Services

Services are objects that perform tasks in your application. They're defined as functions that return the service instance:

```js
// Database connection service
container.set("database", (c) => {
  const config = c.get("dbConfig");
  return new Database(config.host, config.port);
});

// Email service that depends on database
container.set("emailService", (c) => {
  const db = c.get("database");
  return new EmailService(db);
});
```

### Parameters

Parameters store configuration values, strings, numbers, or any non-function data:

```js
// Configuration parameters
container.set("dbConfig", {
  host: "localhost",
  port: 5432,
  database: "myapp",
});

container.set("apiKey", "abc123");
container.set("isProduction", process.env.NODE_ENV === "production");
```

### Factory Services

When you need a **new instance** every time instead of a singleton:

```js
container.set(
  "httpRequest",
  container.factory((c) => {
    const config = c.get("httpConfig");
    return new HttpRequest(config);
  }),
);

// Each call returns a new instance
const req1 = container.get("httpRequest");
const req2 = container.get("httpRequest"); // Different instance
```

## Advanced Features

### Protecting Functions

To store an actual function (not a service factory) as a parameter:

```js
container.set(
  "utility",
  container.protect(() => {
    return Math.random() * 100;
  }),
);

const utilityFn = container.get("utility"); // Returns the function itself
const result = utilityFn(); // Call the function
```

### Extending Services

Add behavior to existing services:

```js
container.set("logger", (c) => new Logger());

// Extend the logger to add file output
container.extend("logger", (logger, c) => {
  logger.addFileHandler("/var/log/app.log");
  return logger;
});
```

### Removing Services or Parameters

Remove services or parameters from the container with `unset()`:

```js
container.set("logger", (c) => new Logger());
container.set("apiUrl", "https://api.example.com");

// Remove a service
container.unset("logger");
console.log(container.has("logger")); // false

// Remove a parameter
container.unset("apiUrl");
console.log(container.has("apiUrl")); // false

// Safe to unset non-existent services
container.unset("nonExistent"); // No error thrown
```

**Important Notes:**

- Removes the service/parameter completely from the container
- Clears any cached instances and metadata for services
- Cannot be undone - you'll need to re-register the service
- Safe to call on non-existent services (no error thrown)

### Optional Dependencies & Defaults

Handle optional services with fallbacks:

```js
container.set("cache", (c) => {
  if (c.has("redisConfig")) {
    return new RedisCache(c.get("redisConfig"));
  }
  return new MemoryCache(); // Fallback
});
```

### Raw Service Access

Get the service definition function instead of the service itself:

```js
container.set("database", (c) => new Database());

const dbFactory = container.raw("database");
const db1 = dbFactory(container);
const db2 = dbFactory(container); // Create another instance manually
```

## ES6 Proxy Mode

Use modern JavaScript syntax for a more natural API:

```js
const container = new Jimple();

// Set services using property syntax
container["logger"] = (c) => new Logger();
container["userService"] = (c) => new UserService(c["logger"]);

// Access services as properties
const userService = container.userService;
```

**Limitations:**

- Can't overwrite built-in methods (`set`, `get`, etc.)
- Accessing non-existent properties throws an error
- TypeScript requires special handling (see below)

## TypeScript Support

Jimple provides full TypeScript support with interface definitions:

### Basic TypeScript Usage

```ts
interface Services {
  logger: Logger;
  database: Database;
  userService: UserService;
  apiKey: string;
}

const container = new Jimple<Services>();

container.set("apiKey", "secret-key");
container.set("logger", (c) => new Logger());
container.set("database", (c) => new Database());
container.set(
  "userService",
  (c) => new UserService(c.get("logger"), c.get("database")),
);

// Type-safe access
const userService: UserService = container.get("userService"); // ✅
const wrong: Database = container.get("userService"); // ❌ Compile error
```

### TypeScript with Proxy Mode

```ts
interface Services {
  logger: Logger;
  userService: UserService;
}

const container = Jimple.create<Services>({
  logger: (c) => new Logger(),
  userService: (c) => new UserService(c.logger),
});

const userService: UserService = container.userService; // ✅ Type-safe
```

**Note**: Due to TypeScript limitations with proxies, you can't set properties directly. Use the `set` method instead:

```ts
container.set("newService", (c) => new Service()); // ✅ Works
container.newService = (c) => new Service(); // ❌ TypeScript error
```

## Modular Configuration with Providers

Organize your container configuration into reusable modules:

### Basic Provider

```js
const databaseProvider = {
  register(container) {
    container.set("dbConfig", {
      host: process.env.DB_HOST ?? "localhost",
      port: process.env.DB_PORT ?? 5432,
    });

    container.set("database", (c) => {
      const config = c.get("dbConfig");
      return new Database(config);
    });
  },
};

container.register(databaseProvider);
```

### File-based Providers (Node.js)

```js
// providers/database.js
module.exports.register = function (container) {
  container.set("database", (c) => new Database(c.get("dbConfig")));
};

// main.js
container.register(require("./providers/database"));
```

### Provider Helper

```js
const { provider } = require("jimple");

module.exports = provider((container) => {
  container.set("apiService", (c) => new ApiService(c.get("apiConfig")));
});
```

### Multiple Named Providers

```js
module.exports = {
  database: provider((c) => {
    c.set("database", () => new Database());
  }),
  cache: provider((c) => {
    c.set("cache", () => new Cache());
  }),
};
```

## API Reference

### Container Methods

| Method               | Description                                      | Returns    |
| -------------------- |--------------------------------------------------| ---------- |
| `set(id, value)`     | Define a service or parameter                    | `void`     |
| `unset(id, value)`   | Remove a service or parameter                    | `void`     |
| `get(id)`            | Retrieve a service or parameter                  | `any`      |
| `has(id)`            | Check if service/parameter exists                | `boolean`  |
| `factory(fn)`        | Create a factory service                         | `fn`       |
| `protect(fn)`        | Protect a function from being treated as service | `fn`       |
| `extend(id, fn)`     | Extend an existing service                       | `void`     |
| `raw(id)`            | Get the raw service definition                   | `Function` |
| `register(provider)` | Register a service provider                      | `void`     |

### Provider Interface

```js
const provider = {
  register(container) {
    // Define services and parameters
  },
};
```

**📚 For complete API documentation with detailed examples, see the [full API reference](https://docs.jimple.dev)**

**📚 For complete API documentation with detailed examples, see the [full API reference](https://docs.jimple.dev)**

## Real-World Example

Here's a more comprehensive example showing how to structure a web application:

```js
import Jimple from "jimple";

const container = new Jimple();

// Configuration
container.set("config", {
  database: {
    host: process.env.DB_HOST ?? "localhost",
    port: process.env.DB_PORT ?? 5432,
  },
  server: {
    port: process.env.PORT ?? 3000,
  },
});

// Infrastructure services
container.set("database", (c) => {
  const config = c.get("config").database;
  return new Database(config.host, config.port);
});

container.set("logger", (c) => {
  return new Logger(c.get("config").logLevel);
});

// Business services
container.set("userRepository", (c) => {
  return new UserRepository(c.get("database"));
});

container.set("userService", (c) => {
  return new UserService(c.get("userRepository"), c.get("logger"));
});

// HTTP services
container.set("userController", (c) => {
  return new UserController(c.get("userService"));
});

container.set("server", (c) => {
  const config = c.get("config").server;
  const app = new ExpressApp();

  app.use("/users", c.get("userController").routes());

  return app;
});

// Start the application
const server = container.get("server");
server.listen(container.get("config").server.port);
```

## More Examples

### Express.js Web Server

```js
import express from "express";
import Jimple from "jimple";

const container = new Jimple();

// Configuration
container.set("port", process.env.PORT ?? 3000);
container.set(
  "corsOrigins",
  process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"],
);

// Services
container.set("app", (c) => {
  const app = express();
  app.use(express.json());
  return app;
});

container.set("cors", (c) => {
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (c.get("corsOrigins").includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    next();
  };
});

container.set("userController", (c) => {
  return {
    getUsers: (req, res) => res.json([{ id: 1, name: "Alice" }]),
    createUser: (req, res) => res.json({ id: 2, ...req.body }),
  };
});

// Setup routes
container.set("server", (c) => {
  const app = c.get("app");
  const cors = c.get("cors");
  const userController = c.get("userController");

  app.use(cors);
  app.get("/users", userController.getUsers);
  app.post("/users", userController.createUser);

  return app;
});

// Start server
const server = container.get("server");
server.listen(container.get("port"), () => {
  console.log(`Server running on port ${container.get("port")}`);
});
```

### Testing with Mocks

```js
// Production container
const container = new Jimple();
container.set("emailService", (c) => new RealEmailService(c.get("apiKey")));
container.set("userService", (c) => new UserService(c.get("emailService")));

// Test container with mocks
const testContainer = new Jimple();
testContainer.set("emailService", () => ({
  send: jest.fn().mockResolvedValue({ success: true }),
}));
testContainer.set("userService", (c) => new UserService(c.get("emailService")));

// Your tests use the mock
const userService = testContainer.get("userService");
await userService.registerUser("test@example.com");
```

### Plugin Architecture

```js
const container = new Jimple();

// Core services
container.set("eventBus", () => new EventEmitter());
container.set("pluginManager", (c) => new PluginManager(c.get("eventBus")));

// Plugin provider
const analyticsPlugin = {
  register(container) {
    container.set("analytics", (c) => {
      const analytics = new Analytics();
      const eventBus = c.get("eventBus");

      eventBus.on("user.created", (user) =>
        analytics.track("user_signup", user),
      );
      eventBus.on("user.login", (user) => analytics.track("user_login", user));

      return analytics;
    });
  },
};

container.register(analyticsPlugin);
```

### Environment-Specific Configuration

```js
const container = new Jimple();
container.set("env", process.env.NODE_ENV ?? "development");

// Base configuration
container.set("baseConfig", {
  database: { poolSize: 10 },
  cache: { ttl: 3600 },
});

container.set("database", (c) => {
  if (c.get("env") === "production") {
    const config = { ...c.get("baseConfig").database, poolSize: 50 };
    return new PostgresDatabase(config);
  }
  return new SQLiteDatabase(":memory:");
});

container.set("cache", (c) => {
  if (c.get("env") === "production") {
    return new RedisCache(process.env.REDIS_URL);
  }
  return new MemoryCache();
});
```

## Extending Jimple

You can create custom container classes:

```js
class MyContainer extends Jimple {
  constructor() {
    super();
    this.loadDefaultServices();
  }

  loadDefaultServices() {
    this.set("logger", () => new DefaultLogger());
  }

  // Add custom methods
  getLogger() {
    return this.get("logger");
  }
}

const container = new MyContainer();
```

## Performance Tips

- **Use factories sparingly** - Only when you truly need new instances
- **Lazy load expensive services** - Services are created only when needed
- **Organize with providers** - Split configuration into logical modules
- **Avoid circular dependencies** - Design services to avoid circular references

## Migration from Other DI Containers

### From Manual Dependency Management

**Before:**

```js
const logger = new Logger();
const database = new Database(config);
const userService = new UserService(logger, database);
```

**After:**

```js
container.set("logger", () => new Logger());
container.set("database", (c) => new Database(c.get("config")));
container.set(
  "userService",
  (c) => new UserService(c.get("logger"), c.get("database")),
);
```

## Documentation

- **📖 [Interactive Guide](https://jimple.js.org/)** - Learn with live examples and tutorials
- **📚 [Complete API Reference](https://jimple.js.org/api/)** - Detailed JSDoc documentation with full method signatures and examples

## License

MIT License - see [LICENSE](https://github.com/fjorgemota/jimple/blob/main/LICENSE) file for details.

---

**Happy coding!** 🎉
