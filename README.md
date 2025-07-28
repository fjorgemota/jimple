# Jimple

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/fjorgemota/jimple/test.yml)
[![npm](https://img.shields.io/npm/v/jimple.svg)](http://npmjs.org/package/jimple/)
[![npm](https://img.shields.io/npm/dt/jimple.svg)](http://npmjs.org/package/jimple/)
[![node](https://img.shields.io/node/v/jimple.svg)](http://npmjs.org/package/jimple)
[![](https://data.jsdelivr.com/v1/package/npm/jimple/badge)](https://www.jsdelivr.com/package/npm/jimple)

This project is a port of the [Pimple Dependency Injection container](https://github.com/silexphp/Pimple/) for Node.js and browsers using ES6 features.

All code is tested using `vitest` and considered stable. Below is the documentation:

## Features

Good projects have good features. Here's what Jimple supports:

* Define services;
* Define factories;
* Define parameters easily;
* Define services/parameters/factories from separate files — so you can split your configuration easily;
* Simple API;
* Runs on Node.js and in the browser;
* Allows extending services easily;
* Allows access to raw service creators;
* Fully typed with TypeScript;
* Stable API;
* No dependencies (in Node.js; in very old browser, a shim might be required);
* No built-in module loader — use **any** loader you prefer;
* [Fully tested](https://github.com/fjorgemota/jimple/actions/workflows/test.yml) on every commit;
* 100% code coverage;
* Fully documented;
* Less than [200 SLOC](https://github.com/fjorgemota/jimple/blob/master/src/Jimple.ts);
* \~1KB minified and gzipped — **tested** on CI using [size-limit](https://github.com/ai/size-limit);
* Supports [ES6 Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) for a more Pimple-like API;
* Did I mention it has a really simple API? :)

## Installation

Install via npm:

```
npm install --save jimple
```

You can also use a CDN like [JSDelivr](https://www.jsdelivr.com/package/npm/jimple). Just include the following in your HTML:

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jimple@latest/src/Jimple.js"></script>
```

**WARNING**: The snippet above always loads the latest version. For production, replace *latest* with a [specific version](https://github.com/fjorgemota/jimple/releases) or install via `npm`.

## Usage

To create a container:

```js
const Jimple = require("jimple");
const container = new Jimple();
```

In the browser:


### ES6 Modules

```js
import Jimple from "jimple";
```

### CommonJS/Browserify

```js
const Jimple = require("jimple");
```

### AMD

```js
define(["jimple"], function(Jimple) {
  // Use Jimple here
});
```

### Script tag

```html
<script src="path/to/Jimple.umd.js"></script>
```

Note: Jimple requires a polyfill for `Map` and `Set` if targeting older browsers. [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/) is a good option.

Jimple manages two types of data: **services** and **parameters**.

## Defining Services

As in Pimple, a service is an object that performs a task within a system — e.g., a DB connection or mailer.

Define services using functions:

```js
container.set('session_storage', function (c) {
  return new SessionStorage('SESSION_ID');
});

container.set('session', function (c) {
  return new Session(c.get('session_storage'));
});
```

Service functions receive the container instance. They are lazy-loaded when first accessed, and order of definition doesn't matter.

```js
const session = container.get('session');
```

## Factory Services

By default, services are cached. To return a **new instance** each time:

```js
container.set('session', container.factory(function (c) {
  return new Session(c.get('session_storage'));
}));
```

## Parameters

Anything that's not a function is treated as a parameter:

```js
container.set('cookie_name', 'SESSION_ID');
```

You can use parameters inside services:

```js
container.set('session_storage', function (c) {
  return new SessionStorage(c.get('cookie_name'));
});
```

### Environment-Based Parameters (Node.js)

```js
container.set('cookie_name', process.env.COOKIE_NAME);
```

## Optional/Default Parameters

You can fallback to default values:

```js
container.set('session_storage', function (c) {
  return new SessionStorage(c.has('cookie_name') ? c.get('cookie_name') : 'COOKIE_ID');
});
```

## Protecting Functions

Functions are treated as services. To store a function as a parameter:

```js
container.set('random_func', container.protect(function () {
  return Math.random();
}));
```

## Extending Services

To add behavior to a service after creation:

```js
container.extend('session_storage', function (storage, c) {
  storage.someMethod();
  return storage;
});
```

> Parameters and protected functions cannot be extended.

## Using Providers

You can modularize configuration by creating provider objects:

```js
const provider = {
  register(container) {
    // define services/parameters
  }
};

container.register(provider);
```

### Providers from Files (Node.js/Browserify)

```js
// file1.js
module.exports.register = function(container) {
  // define stuff
};

container.register(require("./file1"));
```

You can even use an `index.js` to organize modules:

```js
// xpto/index.js
module.exports.register = function(container) {
  container.register(require("./file1"));
  container.register(require("./file2"));
};
```

### Shorthand Provider Function

```js
const { provider } = require("jimple");

module.exports = provider((container) => {
  // define things
});
```

You can also export multiple providers:

```js
module.exports = {
  configA: provider((c) => {}),
  configB: provider((c) => {})
};
```

## Accessing Raw Functions

```js
container.set('session', function (c) {
  return new Session(c.get('session_storage'));
});

const sessionFn = container.raw('session');
```

## Proxy Mode (ES6)

Since v2.0, you can avoid using `get` and `set` methods by using a proxy object. This allows you to access services as properties:

```js
const container = new Jimple();

container['session'] = (c) => new Session(c['session_storage']);
```

Which is equivalent to:

```js
const container = new Jimple();
container.set('session', (c) => new Session(c.get('session_storage')));
```

Note, however, that you can't overwrite method names like `set` or `get`:

```js
container.set = 42; // ❌ Throws
```

And that, if you try to get a property/service/parameter that doesn't exist, it will throw an error:

```js
const container = new Jimple();
container.non_existent; // ❌ Throws
```


## Typescript Support

Jimple is fully typed with TypeScript. You can use it in your TypeScript projects without any issues, and define an interface for your services and parameters, like this:

```ts
interface ServiceParameters {
    session_storage: SessionStorage;
    session: Session;
    session_max_age: number;
}
const container = new Jimple<ServiceParameters>({
    session_storage: (c) => new SessionStorage(c.get('session_max_age')),
    session: (c) => new Session(c.get('session_storage')),
    session_max_age: 3600,
});
const session: Session = container.get('session'); // works just fine
const session2: SessionStorage = container.get('session'); // fails at compile time
```

However, for using Proxy mode, you'll want to construct the object using the `create` static method:

```ts
interface ServiceParameters {
    session_storage: SessionStorage;
    session: Session;
    session_max_age: number;
}
const container = Jimple.create({
  session_storage: (c) => new SessionStorage(c.session_max_age),
  session: (c) => new Session(c.session_storage),
  session_max_age: 3600,
});
const session : Session = container.session; // works just fine
const session2: SessionStorage = container.session; // fails at compile time
```

Due to TypeScript limitations, you won't be able to set properties directly on the container like `container.session = ...`. Instead, you should use the `set` method:

```ts
container.set('session', (c) => new Session(c.session_storage));
```

You can set properties normally in JS, this is just a TypeScript limitation thanks to how it handles types with proxies.

## Extending Jimple (Customization)

You can subclass Jimple using ES6 classes:

```js
const Jimple = require("jimple");

class MyContainer extends Jimple {
  // override methods or add your own
}

const container = new MyContainer();
```

Happy customizing! 🎉
