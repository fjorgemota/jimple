const container = new Jimple();

// Core Logger Provider - Base dependency
const loggerProvider = {
  register(container) {
    container.set("logger", (c) => {
      return {
        info: (msg) => console.log(`ℹ️ [INFO] ${msg}`),
        error: (msg) => console.log(`❌ [ERROR] ${msg}`),
        debug: (msg) => console.log(`🐛 [DEBUG] ${msg}`),
      };
    });
  },
};

// Database Provider - Depends on logger
const databaseProvider = {
  register(container) {
    container.set("database", (c) => {
      const logger = c.get("logger");
      logger.info("Initializing database connection");

      return {
        connect: () => {
          logger.info("Database connected successfully");
          return true;
        },
        query: (sql) => {
          logger.debug(`Executing query: ${sql}`);
          return { rows: [], count: 0 };
        },
        disconnect: () => {
          logger.info("Database disconnected");
        },
      };
    });
  },
};

// User Service Provider - Depends on both logger and database
const userServiceProvider = {
  register(container) {
    container.set("userService", (c) => {
      const logger = c.get("logger");
      const database = c.get("database");

      logger.info("Initializing user service");

      return {
        createUser: (userData) => {
          logger.info(`Creating user: ${userData.name}`);
          database.connect();
          const result = database.query(
            `INSERT INTO users (name, email) VALUES ('${userData.name}', '${userData.email}')`,
          );
          logger.info(
            `User created successfully with ID: ${Math.random().toString(36).substr(2, 9)}`,
          );
          return result;
        },

        getUser: (id) => {
          logger.debug(`Fetching user with ID: ${id}`);
          database.connect();
          const result = database.query(`SELECT * FROM users WHERE id = ${id}`);
          logger.debug("User fetched successfully");
          return { id, name: "John Doe", email: "john@example.com" };
        },
      };
    });
  },
};

// Email Service Provider - Depends on logger and userService
const emailServiceProvider = {
  register(container) {
    container.set("emailService", (c) => {
      const logger = c.get("logger");
      const userService = c.get("userService");

      logger.info("Initializing email service");

      return {
        sendWelcomeEmail: (userId) => {
          const user = userService.getUser(userId);
          logger.info(`Sending welcome email to: ${user.email}`);

          // Simulate email sending
          setTimeout(() => {
            logger.info(`✅ Welcome email sent to ${user.name}`);
          }, 100);

          return { messageId: Math.random().toString(36), sent: true };
        },
      };
    });
  },
};

// Register providers in dependency order
console.log("📦 Registering providers with dependencies...");
container.register(loggerProvider); // Base dependency
container.register(databaseProvider); // Depends on logger
container.register(userServiceProvider); // Depends on logger + database
container.register(emailServiceProvider); // Depends on logger + userService

console.log("\n🚀 Testing provider dependencies:");

// Create a user and send welcome email
const userService = container.get("userService");
const emailService = container.get("emailService");

const newUser = userService.createUser({
  name: "Alice Johnson",
  email: "alice@example.com",
});

emailService.sendWelcomeEmail(1);

console.log("\n✅ All providers working together successfully!");
console.log(
  "📋 Service dependency chain: logger → database → userService → emailService",
);
