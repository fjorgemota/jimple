const container = new Jimple();

// Database connection service
container.set('database', (c) => {
    const config = c.get('dbConfig');
    return {
        connect: () => console.log(`Connected to ${config.host}:${config.port}`),
        query: (sql) => console.log(`Executing: ${sql}`)
    };
});

// Email service that depends on database
container.set('emailService', (c) => {
    const db = c.get('database');
    return {
        sendEmail: (to, subject) => {
            db.query(`INSERT INTO emails (to, subject) VALUES ('${to}', '${subject}')`);
            console.log(`Email sent to ${to}: ${subject}`);
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
emailService.sendEmail('user@example.com', 'Welcome!');