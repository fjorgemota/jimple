# Jimple

[![Build Status](https://travis-ci.org/fjorgemota/jimple.svg)](https://travis-ci.org/fjorgemota/jimple)

This project is a "port" of Pimple Dependency Injection container to NodeJS using features provided by ES6.

The code of this project may not be in his state-of-art, but seems to be a great start to learn a few more about ES6 and it's support to classes and Map/Set, that Node 4.0.0 implemented right away.

All the code is tested using Mocha and seems to be stable. Below is the documentation for the project:

## Usage

Creating a Jimple Container is just a matter of creating a Jimple instance:

```js
var Jimple = require("jimple");

var container = new Jimple();
```

Jimple, as Pimple and many other dependency injections containers, manage two different kind of data: **services** and **parameters**.

## Defining services

As Pimple describes, a service is an object that does something as part of a larger system. Examples of services: a database connection, a templating engine, or a mailer. Almost any global object can be a service. 

Services in Jimple (and in Pimple too!) are defined by anonymous functions that return an instance of an object. Different from Pimple, however, here we need to call the method `set()` on Jimple container, as Proxies in NodeJS seems to not be stable:

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
// define some parameters
container.set('cookie_name', 'SESSION_ID');
``` 

If you change the `session_storage` service definition like below:

```js
container.set('session_storage', function (c) {
    return new SessionStorage(c.get('cookie_name'));
});
```

You can now easily change the cookie name by overriding the `cookie_name` parameter instead of redefining the service definition.

## Protecting parameters

Because Jimple see anything that is a function as a service, you need to wrap anonymous functions with the `protect()` method to store them as parameters:

```js
container.set('random_func', container.protect(function () {
    return Math.random();
}));
```

## Modifying Services after Definition

In some cases you may want to modify a service definition after it has been defined. You can use the `extend()` method to define additional code to be run on your service just after it is created:

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

## Fetching the Service Creation Function

When you access an object, Jimple automatically calls the anonymous function that you defined, which creates the service object for you. If you want to get raw access to this function, but don't want to `protect()` that service, you can use the `raw()` method to access the function directly:

```js
container.set('session', function (c) {
    return new Session(c.get('session_storage'));
});

var sessionFunction = container.raw('session');
```