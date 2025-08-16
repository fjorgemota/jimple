class Logger {
  constructor() {
    this.handlers = [];
  }

  log(message) {
    this.handlers.forEach((handler) => handler(message));
  }

  addFileHandler(filePath) {
    // Simulate adding a file handler
    this.handlers.push((message) => {
      console.log(`Writing to ${filePath}: ${message}`);
    });
  }
}
const container = new Jimple();
container.set("logger", (c) => new Logger());

// Extend the logger to add file output
container.extend("logger", (logger, c) => {
  logger.addFileHandler("/var/log/app.log");
  return logger;
});

// This will use the extended logger
container.logger.log("This is a test message.");
