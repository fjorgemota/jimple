// Create container
const container = new Jimple();

// Define a simple service
container.set('logger', (c) => {
    return {
        log: (msg) => console.log(`[${new Date().toISOString()}] ${msg}`)
    };
});

// Define a service that depends on another
container.set('userService', (c) => {
    const logger = c.get('logger');
    return {
        createUser: (name) => {
            logger.log(`Creating user: ${name}`);
            return { id: Math.random(), name };
        }
    };
});

// Use your services
const userService = container.get('userService');
const user = userService.createUser('Alice');
console.log('User created:', user);