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
* Did I mention it has a really simple API? :)

### Try it Online

If you liked these features, feel free to test Jimple in a Node.js environment without installing anything by using [RunKit](https://npm.runkit.com/jimple). Give it a try! :)

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

### AMD

```js
define(["jimple"], function(Jimple) {
  // Use Jimple here
});
```

### CommonJS/Browserify

```js
const Jimple = require("jimple");
```

### ES6 Modules

```js
import Jimple from "jimple";
```

### Script tag

```html
<script src="path/to/Jimple.js"></script>
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

To avoid calling `.get()` and `.set()` manually, use:

```js
const container = Jimple.proxy();

container['session'] = (c) => new Session(c['session_storage']);
```

Equivalent to:

```js
const container = new Jimple();
container.set('session', (c) => new Session(c.get('session_storage')));
```

Note: `proxy()` can accept a config object:

```js
Jimple.proxy({ SESSION_ID: 'test' });
```

⚠️ **Proxy is not supported in all environments**. It's safe in Node.js (v6+), but avoid it in older browsers.

Also, avoid overwriting method names like `set` or `get`:

```js
container.set = 42; // ❌ Throws
```

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
