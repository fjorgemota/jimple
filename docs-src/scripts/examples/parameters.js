const container = new Jimple();

// Configuration parameters
container.set("dbConfig", {
  host: "localhost",
  port: 5432,
  database: "myapp",
});

container.set("apiKey", "abc123");
container.set("isProduction", false);

// Use parameters in services
container.set("apiClient", (c) => {
  const apiKey = c.get("apiKey");
  const isProduction = c.get("isProduction");

  return {
    baseUrl: isProduction ? "https://api.prod.com" : "https://api.dev.com",
    request: (endpoint) => {
      console.log(`Making request to ${endpoint} with key ${apiKey}`);
    },
  };
});

const client = container.get("apiClient");
client.request("/users");
console.log("Base URL:", client.baseUrl);
