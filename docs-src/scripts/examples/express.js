// Express.js web server with Jimple DI
const container = new Jimple();

// Configuration
container.set("port", 3000);
container.set("corsOrigins", ["http://localhost:3000"]);

// Mock Express app
container.set("app", (c) => {
  const routes = [];
  return {
    use: (middleware) => console.log("Added middleware"),
    get: (path, handler) => {
      routes.push({ method: "GET", path });
      console.log(`Registered GET ${path}`);
    },
    post: (path, handler) => {
      routes.push({ method: "POST", path });
      console.log(`Registered POST ${path}`);
    },
    listen: (port, callback) => {
      console.log(`Server would listen on port ${port}`);
      callback();
    },
    routes,
  };
});

container.set("cors", (c) => {
  return (req, res, next) => {
    console.log("CORS middleware applied");
    next();
  };
});

container.set("userController", (c) => ({
  getUsers: (req, res) => {
    console.log("Getting users...");
    return [{ id: 1, name: "Alice" }];
  },
  createUser: (req, res) => {
    console.log("Creating user...");
    return { id: 2, name: "Bob" };
  },
}));

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
