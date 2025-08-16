const container = new Jimple();

container.set('utility', () => {
    return Math.random() * 100;
});

const utilityFactory = container.raw('utility');
const n1 = utilityFactory(container);
const n2 = utilityFactory(container); // Create another instance manually
console.log(n1);
console.log(n2);