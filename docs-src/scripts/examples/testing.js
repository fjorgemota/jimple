// Testing with mocks example
console.log("=== Production Container ===");

// Production container
const container = new Jimple();

// Mock email service
class RealEmailService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  send(to, subject) {
    console.log(
      `[REAL] Sending email to ${to}: ${subject} (API: ${this.apiKey})`,
    );
    return Promise.resolve({ success: true, id: "email-123" });
  }
}

container.set("apiKey", "prod-api-key");
container.set("emailService", (c) => new RealEmailService(c.get("apiKey")));
container.set("userService", (c) => ({
  registerUser: async (email) => {
    const emailService = c.get("emailService");
    console.log(`Registering user: ${email}`);
    await emailService.send(email, "Welcome!");
    return { id: Math.random(), email };
  },
}));

// Use production service
const userService = container.get("userService");
userService.registerUser("user@example.com");

console.log("\n=== Test Container ===");

// Test container with mocks
const testContainer = new Jimple();
testContainer.set("emailService", () => ({
  send: (to, subject) => {
    console.log(`[MOCK] Would send email to ${to}: ${subject}`);
    return Promise.resolve({ success: true, id: "mock-email" });
  },
}));

testContainer.set("userService", (c) => ({
  registerUser: async (email) => {
    const emailService = c.get("emailService");
    console.log(`[TEST] Registering user: ${email}`);
    const result = await emailService.send(email, "Welcome!");
    console.log("Email result:", result);
    return { id: Math.random(), email };
  },
}));

// Use test service
const testUserService = testContainer.get("userService");
testUserService.registerUser("test@example.com");
