const container = new Jimple();

// Regular service (singleton)
container.set("logger", (c) => {
  console.log("Creating logger instance");
  return {
    log: (msg) => console.log(msg),
  };
});

// Factory service (new instance each time)
container.set(
  "httpRequest",
  container.factory((c) => {
    console.log("Creating new HTTP request instance");
    return {
      id: Math.random(),
      get: (url) => console.log(`GET ${url} (ID: ${Math.random()})`),
    };
  }),
);

// Test singleton behavior
console.log("=== Singleton Test ===");
const logger1 = container.get("logger");
const logger2 = container.get("logger");
console.log("Same logger instance?", logger1 === logger2);

// Test factory behavior
console.log("\n=== Factory Test ===");
const req1 = container.get("httpRequest");
const req2 = container.get("httpRequest");
console.log("Same request instance?", req1 === req2);
console.log("Request 1 ID:", req1.id);
console.log("Request 2 ID:", req2.id);
