const container = new Jimple();

// Define a basic database provider
const databaseProvider = {
  register(container) {
    // Configure database settings
    container.set("dbConfig", {
      host: "localhost",
      port: 5432,
      database: "myapp",
      user: "admin",
    });

    // Create database service
    container.set("database", (c) => {
      const config = c.get("dbConfig");
      return {
        connect: () =>
          console.log(
            `✅ Connected to ${config.database} at ${config.host}:${config.port}`,
          ),
        query: (sql) => console.log(`🔍 Executing: ${sql}`),
        close: () => console.log("❌ Database connection closed"),
      };
    });

    // Create repository service
    container.set("userRepository", (c) => {
      const db = c.get("database");
      return {
        findUser: (id) => {
          db.query(`SELECT * FROM users WHERE id = ${id}`);
          return { id, name: "John Doe", email: "john@example.com" };
        },
        saveUser: (user) => {
          db.query(
            `INSERT INTO users (name, email) VALUES ('${user.name}', '${user.email}')`,
          );
          console.log(`💾 User saved: ${user.name}`);
        },
      };
    });
  },
};

// Register the provider
container.register(databaseProvider);

// Use the services
console.log("🚀 Testing Database Provider:");
const db = container.get("database");
db.connect();

const userRepo = container.get("userRepository");
const user = userRepo.findUser(1);
userRepo.saveUser({ name: "Alice Smith", email: "alice@example.com" });

console.log("\n📋 Available services:", container.keys());
