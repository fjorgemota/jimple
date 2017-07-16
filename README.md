# Jimple

[![Greenkeeper badge](https://badges.greenkeeper.io/fjorgemota/jimple.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/fjorgemota/jimple.svg)](https://travis-ci.org/fjorgemota/jimple)
[![npm](https://img.shields.io/npm/v/jimple.svg)](http://npmjs.org/package/jimple/)
[![npm](https://img.shields.io/npm/dt/jimple.svg)](http://npmjs.org/package/jimple/)
[![node](https://img.shields.io/node/v/jimple.svg)](http://npmjs.org/package/jimple)
[![Codacy Badge](https://api.codacy.com/project/badge/1f3ecae240a747d090bef0340251f57c)](https://www.codacy.com/app/fjorgemota/jimple)
[![Code Climate](https://codeclimate.com/github/fjorgemota/jimple/badges/gpa.svg)](https://codeclimate.com/github/fjorgemota/jimple)
[![Test Coverage](https://codeclimate.com/github/fjorgemota/jimple/badges/coverage.svg)](https://codeclimate.com/github/fjorgemota/jimple/coverage)
[![Issue Count](https://codeclimate.com/github/fjorgemota/jimple/badges/issue_count.svg)](https://codeclimate.com/github/fjorgemota/jimple)

This project is a port of [Pimple Dependency Injection container](https://github.com/silexphp/Pimple/) to NodeJS and to browser using features provided by ES6.

All the code is tested using Mocha and seems to be stable. Below is the documentation for the project:

## Features

Good projects have good features. And because this here's the list of features that Jimple supports:

- Define services;
- Define factories;
- Define parameters easily;
- Defining services/parameters/factories from another files - because you should be able to split your configuration easily;
- Simple API;
- Runs on NodeJS and on browser;
- Allows extending services easily;
- Allow to get the raw service creator easily;
- Pure Javascript;
- Stable API;
- No dependencies (in nodejs, in browser we need a shim);
- No module loader integrated - You can use **any** module loader you want;
- [Fully tested](https://travis-ci.org/fjorgemota/jimple) on each commit;
- [100% code coverage](https://codeclimate.com/github/fjorgemota/jimple/coverage);
- Fully Documented;
- Less than [200 SLOC](https://github.com/fjorgemota/jimple/blob/master/src/Jimple.js);
- I already said that it have a really Simple API? :)

### Testing without installing anything

If you liked that features, feel free to test Jimple **free** on a NodeJS environment without installing anything on your machine by using [Tonic](https://tonicdev.com/npm/jimple). Give it a try. :)

## Installation

The installation of this package is very simple: In fact, it can be installed by just running:

```
    npm install --save jimple
```

If using NodeJS (this installs the package based purely on ES 6), or:

```
    bower install --save jimple
```

If you want to use this package in the browser.

Note that the bower package uses a version compiled by [Babel](http://babeljs.io). And because this, and because browsers does not have great support to Map and Set yet, you will need to load [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/) (or some other similar polyfill) **before** the load of this package on the browser.

## Usage

Creating a Jimple Container is just a matter of creating a Jimple instance:

```js
var Jimple = require("jimple");

var container = new Jimple();
```

In the browser, you can load Jimple using various ways:

- AMD

```js
    define(["jimple"], function(Jimple) {
        // Code using Jimple here..
    });
```

- CommonJS/Browserify:

```js
    var Jimple = require("jimple");
```

- Script tag:

```html
    <script language="javascript" src="path/to/Jimple.js"></script>
```

Again, it's important to note that Jimple needs of a polyfill to Map and Set classes - which are not supported by all the latest browsers actually - to do so, you can choice between some options, like [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/) for example.

Jimple, as Pimple and many other dependency injections containers, manage two different kind of data: **services** and **parameters**.

## Defining services

As Pimple describes, a service is an object that does something as part of a larger system. Examples of services: a database connection, a templating engine, or a mailer. Almost any global object can be a service.

Services in Jimple (and in Pimple too!) are defined by anonymous functions that return an instance of an object. Note that, in Jimple, you cannot use a generator as a service, as they will be detected as parameters, so, just **pure** functions can be a service. Different from Pimple, however, here we need to call the method `set()` on Jimple container, as Proxies in NodeJS seems to not be stable:

```js
// define some services
container.set('session_storage', function (c) {
    return new SessionStorage('SESSION_ID');
});

container.set('session', function (c) {
    return new Session(c.get('session_storage'));
});
```

Notice that the anonymous function that define a service has access to the current container instance, allowing references to other services or parameters.

The objects are created on demand, just when you get them. The order of the definitions does not matter.

Using the defined services is very easy, too:

```js
// get the session object
var session = container.get('session');

// the above call is roughly equivalent to the following code:
// var storage = new SessionStorage('SESSION_ID');
// var session = new Session(storage);
```

## Defining factory services

By default, when you get a service, Jimple automatically cache it's value, returning always the **same instance** of it. If you want a different instance to be returned for all calls, wrap your anonymous function with the `factory()` method:

```js
container.set('session', container.factory(function (c) {
    return new Session(c.get('session_storage'));
}));
```

Now, each time you call `container.get('session')`, a new instance of `Session` is returned for you.

## Defining parameters

Defining a parameter allows to ease the configuration of your container from the outside and to store global values. In Jimple, parameters are defined as anything that it's not a function:

```js
// define a parameter called cookie_name
container.set('cookie_name', 'SESSION_ID');
```

If you change the `session_storage` service definition like below:

```js
container.set('session_storage', function (c) {
    return new SessionStorage(c.get('cookie_name'));
});
```

You can now easily change the cookie name by overriding the `cookie_name` parameter instead of redefining the service definition.

### Defining parameters based on environment variables (NodeJS only)

Do you wanna do define parameters in the container based on environment variables? It's okay! You can define it easily like that:

```js
//define parameter based on environment variable
container.set('cookie_name', process.env.COOKIE_NAME);
```

## Optional/Default parameters/services

Not all services need all the services or parameters always, and you may do well with a default value for an parameter or service. In this case, you can do something like that:

```js
container.set('session_storage', function (c) {
    return new SessionStorage(c.has('cookie_name') ? c.get('cookie_name') : 'COOKIE_ID');
});
```

In this example, if the parameter `cookie_name` does not exist, the SessionStorage will be instantiated with the default `'COOKIE_ID'`, and this works for services too. :)


## Protecting parameters

Because Jimple see anything that is a function as a service, you need to wrap anonymous functions with the `protect()` method to store them as parameters:

```js
container.set('random_func', container.protect(function () {
    return Math.random();
}));
```

## Modifying Services after Definition

In some cases you may want to modify a **service definition** (note that you cannot extend a parameter, including protected parameters) after it has been defined. You can use the `extend()` method to define additional code to be run on your service just after it is created:

```js
container.set('session_storage', function (c) {
    return new SessionStorage(c.get('cookie_name'));
});

container.extend('session_storage', function (storage, c) {
    storage.someMethod();

    return storage;
});
```

The first argument is the name of the service to extend, the second a function that gets access to the object instance and the container.

## Extending a Container

If you use the same libraries over and over, you might want to reuse some services from one project to the next one; package your services into a provider by implementing the following object structure by duck-typing:

```js
var provider = {
	"register": function(c) {
		// Define your services and parameters here
	}
}
```

Because JS has no support to interfaces yet, we cannot validate too much the structure of the provider.

After creating a object with that structure, you can register it in the container:

```js
container.register(provider);
```

### Extending a container from a file (NodeJS/Browserify only)

If you want to split your container's configuration (so each file is more..simple and specific), you can create multiple files like that:

**file1.js:**

```js
module.exports.register = function(container) {
    // Define your services and parameters here
}
```

To load the package, you can do something like:

```js
container.register(require("./file1"))
```

You can, inclusive, create **directories** with container's configuration, by doing something like that:

**xpto/file1.js:**

```js
module.exports.register = function(container) {
    // Define your services and parameters here
}
```

**xpto/file2.js:**

```js
module.exports.register = function(container) {
    // Define your services and parameters here
}
```

**xpto/index.js:**

```js
module.exports.register = function(container) {
    container.register(require("./file1"));
    container.register(require("./file2"));   
}
```

And, finally, in some file creating the container:

```js
container.register(require("./xpto"));
```

Note that the **index.js** file is loaded first on **xpto** directory, and that **index.js** file loads the files **file1.js** and **file2.js** present on that directory. You can do that for any number of directories. :)

## Fetching the Service Creation Function

When you access an object, Jimple automatically calls the anonymous function that you defined, which creates the service object for you. If you want to get raw access to this function, but don't want to `protect()` that service, you can use the `raw()` method to access the function directly:

```js
container.set('session', function (c) {
    return new Session(c.get('session_storage'));
});

var sessionFunction = container.raw('session');
```

## Last, but not least important: Customization

Do you wanna to customize Jimple's functionally? You can! Just extend it using ES6's class syntax:

```js
var Jimple = require("jimple");

class ABigContainer extends Jimple {
    // Overwrite any of Jimple's method here, or add new methods
}

var container = new ABigContainer();
```

Good customization. :)
