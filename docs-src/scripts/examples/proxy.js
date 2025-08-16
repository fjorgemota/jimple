// Using ES6 Proxy mode for cleaner syntax
const container = Jimple.create();

// Set services using property syntax
container["logger"] = (c) => ({
  log: (msg) => console.log(`[LOG] ${msg}`),
});

container["userService"] = (c) => ({
  createUser: (name) => {
    c["logger"].log(`Creating user: ${name}`);
    return { id: Math.random(), name };
  },
});

// Access services as properties
const userService = container["userService"];
const user = userService.createUser("Bob");
console.log("Created user:", user);

// Compare with traditional syntax
console.log("\n=== Traditional syntax ===");
const container2 = new Jimple();
container2.set("logger", (c) => ({
  log: (msg) => console.log(`[TRADITIONAL] ${msg}`),
}));

const logger = container2.get("logger");
logger.log("This is traditional syntax");
