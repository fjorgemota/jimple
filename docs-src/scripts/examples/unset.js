class Logger {}

const container = new Jimple();

container.set("logger", (c) => new Logger());
container.set("apiUrl", "https://api.example.com");

// Remove a service
console.log(container.has("logger")); // true
container.unset("logger");
console.log(container.has("logger")); // false

// Remove a parameter
console.log(container.has("apiUrl")); // true
container.unset("apiUrl");
console.log(container.has("apiUrl")); // false

// Safe to unset non-existent services
container.unset("nonExistent"); // No error thrown
container.unset("nonExistent"); // No error thrown
