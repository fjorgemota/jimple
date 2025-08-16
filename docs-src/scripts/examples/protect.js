const container = new Jimple();
container.set('utility', container.protect(() => {
    return Math.random() * 100;
}));

const utilityFn = container.get('utility'); // Returns the function itself
const result = utilityFn(); // Call the function

console.log(result);