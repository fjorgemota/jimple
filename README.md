# Jimple

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/fjorgemota/jimple/test.yml?label=tests)
[![npm version](https://img.shields.io/npm/v/jimple.svg)](https://www.npmjs.com/package/jimple)
[![npm downloads](https://img.shields.io/npm/dt/jimple.svg)](https://www.npmjs.com/package/jimple)
[![node](https://img.shields.io/node/v/jimple.svg)](https://nodejs.org)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/jimple/badge)](https://www.jsdelivr.com/package/npm/jimple)

**Jimple** is a tiny, fully‑typed port of the [Pimple Dependency Injection container](https://github.com/silexphp/Pimple/) for Node.js and modern browsers, built with ES‑2015 features.

All code is tested with **vitest** and considered production‑ready.

---

## Features

* Register services, factories, and plain parameters.
* Split definitions across multiple files for clean configuration.
* Straight‑forward, minimal API.
* Works in both Node.js and the browser.
* Easily extend existing services or access their raw creators.
* Full TypeScript typings out‑of‑the‑box.
* Stable public API — no surprises between releases.
* Zero runtime dependencies (a `Map`/`Set` polyfill is required only in very old browsers).
* Loader‑agnostic — use **any** module system you prefer.
* Continuous integration on every commit with 100 % code coverage.
* Less than **200 SLOC** and \~**1 kB** minified + gzipped (verified by [size‑limit](https://github.com/ai/size-limit)).
* Optional ES6 **Proxy** mode for an even more Pimple‑like syntax.

---

## Installation

```bash
npm install --save jimple
```

Or via CDN (great for quick demos):

```html
<script src="https://cdn.jsdelivr.net/npm/jimple@latest/src/Jimple.js"></script>
```

> **Heads‑up:** The snippet above always pulls the *latest* version. In production, pin it to a [specific release](https://github.com/fjorgemota/jimple/releases) or install via your favorite package manager (npm/pnpm/etc.).

---

## Usage

Create a container and start registering things:

### ES6 Modules

```js
import Jimple from "jimple";

const container = new Jimple();

container.set("session_storage", () => new SessionStorage("SESSION_ID"));
container.set("session", (c) => new Session(c.get("session_storage")));

const session = container.get("session");
```

### CommonJS / Browserify

```js
const Jimple = require("jimple");
// same API as above
```

### AMD

```js
define(["jimple"], (Jimple) => {
  const c = new Jimple();
});
```

### Script tag

```html
<script src="path/to/Jimple.umd.js"></script>
```

> Targeting very old browsers? Add a `Map`/`Set` polyfill such as `core-js`.

---

## Service Factories

Services are cached after the first call. To get a **fresh instance** every time:

```js
container.set("session", container.factory((c) => {
  return new Session(c.get("session_storage"));
}));
```

---

## Parameters

Anything that isn’t a function is stored verbatim:

```js
container.set("cookie_name", "SESSION_ID");
```

Use it inside services:

```js
container.set("session_storage", (c) => {
  return new SessionStorage(c.get("cookie_name"));
});
```

---

## Protecting Functions

Want to keep a function as a parameter?

```js
container.set("rng", container.protect(() => Math.random()));
```

---

## Extending Services

```js
container.extend("session_storage", (storage) => {
  storage.enableLogging();
  return storage;
});
```

> **Note:** Parameters and protected functions cannot be extended.

---

## Providers

Group related definitions:

```js
const provider = {
  register(c) {
    // define services/parameters here
  },
};

container.register(provider);
```

Or use the built‑in helper:

```js
const Jimple = require("jimple");

module.exports = Jimple.provider((c) => {
  /* definitions */
});
```

---

## Accessing Raw Creators

```js
const originalFactory = container.raw("session");
```

---

## Proxy Mode

Enable property‑style access:

```js
const c = Jimple.create({
  session_storage: () => new SessionStorage("SESSION_ID"),
  session: (c) => new Session(c.session_storage),
});

const s = c.session; // lazy‑loaded and cached
```

Attempting to read an undefined key or overwrite core methods throws.

---

## TypeScript

Jimple ships with full typings:

```ts
interface Services {
  session_storage: SessionStorage;
  session: Session;
  session_max_age: number;
}

const container = new Jimple<Services>();

container.set("session_max_age", 3600);
container.set("session_storage", (c) => new SessionStorage(c.get("session_max_age")));
container.set("session", (c) => new Session(c.get("session_storage")));

const session = container.get("session");      // Session
type Storage = typeof session;                  // Session (type‑safe)
```

When using Proxy mode, construct via `Jimple.create`:

```ts
const c = Jimple.create<Services>({
  /* … */
});

c.session.someMethod();
```

(Direct property assignment is not allowed in TS; use `set` instead.)

---

## Extending Jimple

```js
class MyContainer extends Jimple {
  // custom helpers
}

const c = new MyContainer();
```

---

Happy coding! 🎉
