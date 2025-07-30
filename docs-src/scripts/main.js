import '../styles/main.css';
import Jimple from "../../dist/Jimple.module.js";
import * as monaco from 'monaco-editor';
import * as ts from 'typescript/lib/typescript.js';

window.Jimple = Jimple;

const editors = {};
const examples = {
    quickstart: {
        typescript: `// Create container
const container = new Jimple();

// Define a simple service
container.set('logger', (c) => {
  return {
    log: (msg: string) => console.log(\`[\${new Date().toISOString()}] \${msg}\`)
  };
});

// Define a service that depends on another
container.set('userService', (c) => {
  const logger = c.get('logger');
  return {
    createUser: (name: string) => {
      logger.log(\`Creating user: \${name}\`);
      return { id: Math.random(), name };
    }
  };
});

// Use your services
const userService = container.get('userService');
const user = userService.createUser('Alice');
console.log('User created:', user);`,
        javascript: `// Create container
const container = new Jimple();

// Define a simple service
container.set('logger', (c) => {
  return {
    log: (msg) => console.log(\`[\${new Date().toISOString()}] \${msg}\`)
  };
});

// Define a service that depends on another
container.set('userService', (c) => {
  const logger = c.get('logger');
  return {
    createUser: (name) => {
      logger.log(\`Creating user: \${name}\`);
      return { id: Math.random(), name };
    }
  };
});

// Use your services
const userService = container.get('userService');
const user = userService.createUser('Alice');
console.log('User created:', user);`
    },
    services: {
        typescript: `const container = new Jimple();

// Database connection service
container.set('database', (c) => {
  const config = c.get('dbConfig');
  return {
    connect: () => console.log(\`Connected to \${config.host}:\${config.port}\`),
    query: (sql: string) => console.log(\`Executing: \${sql}\`)
  };
});

// Email service that depends on database
container.set('emailService', (c) => {
  const db = c.get('database');
  return {
    sendEmail: (to: string, subject: string) => {
      db.query(\`INSERT INTO emails (to, subject) VALUES ('\${to}', '\${subject}')\`);
      console.log(\`Email sent to \${to}: \${subject}\`);
    }
  };
});

// Configuration
container.set('dbConfig', {
  host: 'localhost',
  port: 5432,
  database: 'myapp'
});

// Use the services
const emailService = container.get('emailService');
emailService.sendEmail('user@example.com', 'Welcome!');`,
        javascript: `const container = new Jimple();

// Database connection service
container.set('database', (c) => {
  const config = c.get('dbConfig');
  return {
    connect: () => console.log(\`Connected to \${config.host}:\${config.port}\`),
    query: (sql) => console.log(\`Executing: \${sql}\`)
  };
});

// Email service that depends on database
container.set('emailService', (c) => {
  const db = c.get('database');
  return {
    sendEmail: (to, subject) => {
      db.query(\`INSERT INTO emails (to, subject) VALUES ('\${to}', '\${subject}')\`);
      console.log(\`Email sent to \${to}: \${subject}\`);
    }
  };
});

// Configuration
container.set('dbConfig', {
  host: 'localhost',
  port: 5432,
  database: 'myapp'
});

// Use the services
const emailService = container.get('emailService');
emailService.sendEmail('user@example.com', 'Welcome!');`
    },
    parameters: {
        typescript: `const container = new Jimple();

// Configuration parameters
container.set('dbConfig', {
  host: 'localhost',
  port: 5432,
  database: 'myapp'
});

container.set('apiKey', 'abc123');
container.set('isProduction', false);

// Use parameters in services
container.set('apiClient', (c) => {
  const apiKey = c.get('apiKey');
  const isProduction = c.get('isProduction');

  return {
    baseUrl: isProduction ? 'https://api.prod.com' : 'https://api.dev.com',
    request: (endpoint: string) => {
      console.log(\`Making request to \${endpoint} with key \${apiKey}\`);
    }
  };
});

const client = container.get('apiClient');
client.request('/users');
console.log('Base URL:', client.baseUrl);`,
        javascript: `const container = new Jimple();

// Configuration parameters
container.set('dbConfig', {
  host: 'localhost',
  port: 5432,
  database: 'myapp'
});

container.set('apiKey', 'abc123');
container.set('isProduction', false);

// Use parameters in services
container.set('apiClient', (c) => {
  const apiKey = c.get('apiKey');
  const isProduction = c.get('isProduction');

  return {
    baseUrl: isProduction ? 'https://api.prod.com' : 'https://api.dev.com',
    request: (endpoint) => {
      console.log(\`Making request to \${endpoint} with key \${apiKey}\`);
    }
  };
});

const client = container.get('apiClient');
client.request('/users');
console.log('Base URL:', client.baseUrl);`
    },
    factory: {
        typescript: `const container = new Jimple();

// Regular service (singleton)
container.set('logger', (c) => {
  console.log('Creating logger instance');
  return {
    log: (msg: string) => console.log(msg)
  };
});

// Factory service (new instance each time)
container.set('httpRequest', container.factory((c) => {
  console.log('Creating new HTTP request instance');
  return {
    id: Math.random(),
    get: (url: string) => console.log(\`GET \${url} (ID: \${Math.random()})\`)
  };
}));

// Test singleton behavior
console.log('=== Singleton Test ===');
const logger1 = container.get('logger');
const logger2 = container.get('logger');
console.log('Same logger instance?', logger1 === logger2);

// Test factory behavior
console.log('\\n=== Factory Test ===');
const req1 = container.get('httpRequest');
const req2 = container.get('httpRequest');
console.log('Same request instance?', req1 === req2);
console.log('Request 1 ID:', req1.id);
console.log('Request 2 ID:', req2.id);`,
        javascript: `const container = new Jimple();

// Regular service (singleton)
container.set('logger', (c) => {
  console.log('Creating logger instance');
  return {
    log: (msg) => console.log(msg)
  };
});

// Factory service (new instance each time)
container.set('httpRequest', container.factory((c) => {
  console.log('Creating new HTTP request instance');
  return {
    id: Math.random(),
    get: (url) => console.log(\`GET \${url} (ID: \${Math.random()})\`)
  };
}));

// Test singleton behavior
console.log('=== Singleton Test ===');
const logger1 = container.get('logger');
const logger2 = container.get('logger');
console.log('Same logger instance?', logger1 === logger2);

// Test factory behavior
console.log('\\n=== Factory Test ===');
const req1 = container.get('httpRequest');
const req2 = container.get('httpRequest');
console.log('Same request instance?', req1 === req2);
console.log('Request 1 ID:', req1.id);
console.log('Request 2 ID:', req2.id);`
    },
    proxy: {
        typescript: `// Using ES6 Proxy mode for cleaner syntax
const container = Jimple.create();

// Set services using property syntax
container['logger'] = (c) => ({
  log: (msg: string) => console.log(\`[LOG] \${msg}\`)
});

container['userService'] = (c) => ({
  createUser: (name: string) => {
    c['logger'].log(\`Creating user: \${name}\`);
    return { id: Math.random(), name };
  }
});

// Access services as properties
const userService = container['userService'];
const user = userService.createUser('Bob');
console.log('Created user:', user);

// Compare with traditional syntax
console.log('\\n=== Traditional syntax ===');
const container2 = new Jimple();
container2.set('logger', (c) => ({
  log: (msg: string) => console.log(\`[TRADITIONAL] \${msg}\`)
}));

const logger = container2.get('logger');
logger.log('This is traditional syntax');`,
        javascript: `// Using ES6 Proxy mode for cleaner syntax
const container = Jimple.create();

// Set services using property syntax
container['logger'] = (c) => ({
  log: (msg) => console.log(\`[LOG] \${msg}\`)
});

container['userService'] = (c) => ({
  createUser: (name) => {
    c['logger'].log(\`Creating user: \${name}\`);
    return { id: Math.random(), name };
  }
});

// Access services as properties
const userService = container['userService'];
const user = userService.createUser('Bob');
console.log('Created user:', user);

// Compare with traditional syntax
console.log('\\n=== Traditional syntax ===');
const container2 = new Jimple();
container2.set('logger', (c) => ({
  log: (msg) => console.log(\`[TRADITIONAL] \${msg}\`)
}));

const logger = container2.get('logger');
logger.log('This is traditional syntax');`
    },
    typescript: {
        typescript: `// Define service interface
interface Services {
  logger: {
    log(msg: string): void;
  };
  database: {
    connect(): void;
    query(sql: string): void;
  };
  userService: {
    createUser(name: string): { id: number; name: string };
  };
  apiKey: string;
}

// Create typed container
const container = new Jimple<Services>();

container.set('apiKey', 'secret-key-123');

container.set('logger', (c) => ({
  log: (msg: string) => console.log(\`[\${new Date().toISOString()}] \${msg}\`)
}));

container.set('database', (c) => ({
  connect: () => console.log('Connected to database'),
  query: (sql: string) => console.log(\`Executing: \${sql}\`)
}));

container.set('userService', (c) => ({
  createUser: (name: string) => {
    const logger = c.get('logger');
    const db = c.get('database');

    logger.log(\`Creating user: \${name}\`);
    db.query(\`INSERT INTO users (name) VALUES ('\${name}')\`);

    return { id: Math.random(), name };
  }
}));

// Type-safe access
const userService: Services['userService'] = container.get('userService');
const user = userService.createUser('Charlie');
console.log('User created:', user);

// This would cause a TypeScript error:
// const wrong: Services['database'] = container.get('userService');`
    },
    express: {
        typescript: `// Express.js web server with Jimple DI
const container = new Jimple();

// Configuration
container.set('port', 3000);
container.set('corsOrigins', ['http://localhost:3000']);

// Mock Express app
container.set('app', (c) => {
  const routes: any[] = [];
  return {
    use: (middleware: any) => console.log('Added middleware'),
    get: (path: string, handler: any) => {
      routes.push({ method: 'GET', path });
      console.log(\`Registered GET \${path}\`);
    },
    post: (path: string, handler: any) => {
      routes.push({ method: 'POST', path });
      console.log(\`Registered POST \${path}\`);
    },
    listen: (port: number, callback: () => void) => {
      console.log(\`Server would listen on port \${port}\`);
      callback();
    },
    routes
  };
});

container.set('cors', (c) => {
  return (req: any, res: any, next: any) => {
    console.log('CORS middleware applied');
    next();
  };
});

container.set('userController', (c) => ({
  getUsers: (req: any, res: any) => {
    console.log('Getting users...');
    return [{ id: 1, name: 'Alice' }];
  },
  createUser: (req: any, res: any) => {
    console.log('Creating user...');
    return { id: 2, name: 'Bob' };
  }
}));

// Setup routes
container.set('server', (c) => {
  const app = c.get('app');
  const cors = c.get('cors');
  const userController = c.get('userController');

  app.use(cors);
  app.get('/users', userController.getUsers);
  app.post('/users', userController.createUser);

  return app;
});

// Start server
const server = container.get('server');
server.listen(container.get('port'), () => {
  console.log(\`Server running on port \${container.get('port')}\`);
});`,
        javascript: `// Express.js web server with Jimple DI
const container = new Jimple();

// Configuration
container.set('port', 3000);
container.set('corsOrigins', ['http://localhost:3000']);

// Mock Express app
container.set('app', (c) => {
  const routes = [];
  return {
    use: (middleware) => console.log('Added middleware'),
    get: (path, handler) => {
      routes.push({ method: 'GET', path });
      console.log(\`Registered GET \${path}\`);
    },
    post: (path, handler) => {
      routes.push({ method: 'POST', path });
      console.log(\`Registered POST \${path}\`);
    },
    listen: (port, callback) => {
      console.log(\`Server would listen on port \${port}\`);
      callback();
    },
    routes
  };
});

container.set('cors', (c) => {
  return (req, res, next) => {
    console.log('CORS middleware applied');
    next();
  };
});

container.set('userController', (c) => ({
  getUsers: (req, res) => {
    console.log('Getting users...');
    return [{ id: 1, name: 'Alice' }];
  },
  createUser: (req, res) => {
    console.log('Creating user...');
    return { id: 2, name: 'Bob' };
  }
}));

// Setup routes
container.set('server', (c) => {
  const app = c.get('app');
  const cors = c.get('cors');
  const userController = c.get('userController');

  app.use(cors);
  app.get('/users', userController.getUsers);
  app.post('/users', userController.createUser);

  return app;
});

// Start server
const server = container.get('server');
server.listen(container.get('port'), () => {
  console.log(\`Server running on port \${container.get('port')}\`);
});`
    },
    testing: {
        typescript: `// Testing with mocks example
console.log('=== Production Container ===');

// Production container
const container = new Jimple();

// Mock email service
const RealEmailService = class {
  constructor(private apiKey: string) {}

  send(to: string, subject: string) {
    console.log(\`[REAL] Sending email to \${to}: \${subject} (API: \${this.apiKey})\`);
    return Promise.resolve({ success: true, id: 'email-123' });
  }
};

container.set('apiKey', 'prod-api-key');
container.set('emailService', (c) => new RealEmailService(c.get('apiKey')));
container.set('userService', (c) => ({
  registerUser: async (email: string) => {
    const emailService = c.get('emailService');
    console.log(\`Registering user: \${email}\`);
    await emailService.send(email, 'Welcome!');
    return { id: Math.random(), email };
  }
}));

// Use production service
const userService = container.get('userService');
userService.registerUser('user@example.com');

console.log('\\n=== Test Container ===');

// Test container with mocks
const testContainer = new Jimple();
testContainer.set('emailService', () => ({
  send: (to: string, subject: string) => {
    console.log(\`[MOCK] Would send email to \${to}: \${subject}\`);
    return Promise.resolve({ success: true, id: 'mock-email' });
  }
}));

testContainer.set('userService', (c) => ({
  registerUser: async (email: string) => {
    const emailService = c.get('emailService');
    console.log(\`[TEST] Registering user: \${email}\`);
    const result = await emailService.send(email, 'Welcome!');
    console.log('Email result:', result);
    return { id: Math.random(), email };
  }
}));

// Use test service
const testUserService = testContainer.get('userService');
testUserService.registerUser('test@example.com');`,
        javascript: `// Testing with mocks example
console.log('=== Production Container ===');

// Production container
const container = new Jimple();

// Mock email service
class RealEmailService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  send(to, subject) {
    console.log(\`[REAL] Sending email to \${to}: \${subject} (API: \${this.apiKey})\`);
    return Promise.resolve({ success: true, id: 'email-123' });
  }
}

container.set('apiKey', 'prod-api-key');
container.set('emailService', (c) => new RealEmailService(c.get('apiKey')));
container.set('userService', (c) => ({
  registerUser: async (email) => {
    const emailService = c.get('emailService');
    console.log(\`Registering user: \${email}\`);
    await emailService.send(email, 'Welcome!');
    return { id: Math.random(), email };
  }
}));

// Use production service
const userService = container.get('userService');
userService.registerUser('user@example.com');

console.log('\\n=== Test Container ===');

// Test container with mocks
const testContainer = new Jimple();
testContainer.set('emailService', () => ({
  send: (to, subject) => {
    console.log(\`[MOCK] Would send email to \${to}: \${subject}\`);
    return Promise.resolve({ success: true, id: 'mock-email' });
  }
}));

testContainer.set('userService', (c) => ({
  registerUser: async (email) => {
    const emailService = c.get('emailService');
    console.log(\`[TEST] Registering user: \${email}\`);
    const result = await emailService.send(email, 'Welcome!');
    console.log('Email result:', result);
    return { id: Math.random(), email };
  }
}));

// Use test service
const testUserService = testContainer.get('userService');
testUserService.registerUser('test@example.com');`
    }
};

// Initialize all editors
Object.keys(examples).forEach(exampleKey => {
    const editorElement = document.getElementById(`${exampleKey}-editor`);
    if (!editorElement) return;

    const editor = monaco.editor.create(editorElement, {
        value: examples[exampleKey].typescript || examples[exampleKey].javascript,
        language: 'typescript',
        theme: 'vs-dark',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        automaticLayout: true
    });

    editors[exampleKey] = {
        editor,
        currentLang: 'typescript'
    };

    // Add run button
    const runButton = document.createElement('button');
    runButton.textContent = 'Run';
    runButton.className = 'playground-btn';
    runButton.style.background = '#10b981';
    runButton.style.color = 'white';
    runButton.onclick = () => runCode(exampleKey);

    const buttonContainer = editorElement.parentElement.querySelector('.playground-buttons');
    buttonContainer.appendChild(runButton);

    // Add language toggle buttons
    const buttons = buttonContainer.querySelectorAll('.playground-btn[data-lang]');
    buttons.forEach(button => {
        button.onclick = () => switchLanguage(exampleKey, button.dataset.lang);
    });
});

function switchLanguage(exampleKey, lang) {
    const editorData = editors[exampleKey];
    if (!editorData || !examples[exampleKey][lang]) return;

    editorData.editor.setValue(examples[exampleKey][lang]);
    editorData.currentLang = lang;

    // Update language mode
    const model = editorData.editor.getModel();
    if (model) {
        monaco.editor.setModelLanguage(model, lang === 'typescript' ? 'typescript' : 'javascript');
    }

    // Update button states
    const playground = document.getElementById(`${exampleKey}-editor`).parentElement;
    const buttons = playground.querySelectorAll('.playground-btn[data-lang]');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function runCode(exampleKey) {
    const editorData = editors[exampleKey];
    if (!editorData) return;

    const code = editorData.editor.getValue();
    const outputElement = document.getElementById(`${exampleKey}-output`);

    // Clear previous output
    outputElement.innerHTML = '';

    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    const logs = [];

    console.log = (...args) => {
        logs.push({ type: 'log', args });
        originalLog(...args);
    };

    console.error = (...args) => {
        logs.push({ type: 'error', args });
        originalError(...args);
    };

    try {
        let executableCode = code;

        // Remove import statements for demo
        executableCode = executableCode
            .replace(/import.*from.*['"];?/g, '')
            .replace(/export.*{.*};?/g, '');

        // Transpile TypeScript to JavaScript if needed
        if (editorData.currentLang === 'typescript') {
            try {
                executableCode = transpileTypeScript(executableCode);
            } catch (transpileError) {
                outputElement.innerHTML = `<div style="color: #ef4444;">TypeScript Error: ${transpileError.message}</div>`;
                return;
            }
        }

        // Execute the code
        eval(executableCode);

        // Display output
        if (logs.length === 0) {
            outputElement.innerHTML = '<span style="color: #64748b;">Code executed successfully (no output)</span>';
        } else {
            outputElement.innerHTML = logs.map(log => {
                const color = log.type === 'error' ? '#ef4444' : '#94a3b8';
                const content = log.args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                return `<div style="color: ${color}; margin-bottom: 0.5rem;">${content}</div>`;
            }).join('');
        }
    } catch (error) {
        outputElement.innerHTML = `<div style="color: #ef4444;">Runtime Error: ${error.message}</div>`;
    } finally {
        // Restore console
        console.log = originalLog;
        console.error = originalError;
    }
}

// Robust TypeScript transpiler using the official TypeScript compiler
function transpileTypeScript(code) {
    if (typeof ts === 'undefined') {
        // Fallback: show helpful message and try to run as JavaScript
        console.warn('TypeScript compiler not available. Attempting to run as JavaScript...');
        return code.replace(/:\s*\w+/g, '').replace(/interface[^}]+}/g, '');
    }

    try {
        const compilerOptions = {
            target: ts.ScriptTarget.ES2018,
            module: ts.ModuleKind.None,
            removeComments: false,
            strict: false,
            skipLibCheck: true,
            skipDefaultLibCheck: true,
            allowJs: true,
            noEmitOnError: false,
            noImplicitAny: false,
            suppressImplicitAnyIndexErrors: true,
            // Additional options for better compatibility
            downlevelIteration: true,
            allowSyntheticDefaultImports: true,
            esModuleInterop: true
        };

        const result = ts.transpile(code, compilerOptions);

        if (!result) {
            throw new Error('Failed to transpile TypeScript code');
        }

        return result;
    } catch (error) {
        // If TypeScript compilation fails, provide helpful error
        throw new Error(`TypeScript compilation failed: ${error.message || 'Unknown error'}`);
    }
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Package manager tabs
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        const tabName = this.dataset.tab;
        const tabContainer = this.closest('.install-tabs');

        // Update button states
        tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');

        // Update tab content
        tabContainer.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        tabContainer.querySelector(`#tab-${tabName}`).classList.add('active');
    });
});