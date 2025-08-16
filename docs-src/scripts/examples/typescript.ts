import Jimple from '../../..';
// Define service interface
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
// Notice you need to use the create() static method if you want to access services via properties on Typescript using ES6 Proxy
const container = Jimple.create<Services>();

container.set('apiKey', 'secret-key-123');

container.set('logger', (c) => ({
    log: (msg: string) => console.log(`[${new Date().toISOString()}] ${msg}`)
}));

container.set('database', (c) => ({
    connect: () => console.log('Connected to database'),
    query: (sql: string) => console.log(`Executing: ${sql}`)
}));

container.set('userService', (c) => ({
    createUser: (name: string) => {
        const logger = c.logger;
        const db = c.database;

        logger.log(`Creating user: ${name}`);
        db.query(`INSERT INTO users (name) VALUES ('${name}')`);

        return { id: Math.random(), name };
    }
}));

// Type-safe access
const userService: Services['userService'] = container.get('userService');
// This also works!
const userService2: Services['userService'] = container.userService;
const user = userService.createUser('Charlie');
console.log('User created:', user);
const user2 = userService.createUser('Fernando');
console.log('User2 created:', user2);

// This would cause a TypeScript error:
// const wrong: Services['database'] = container.get('userService');

