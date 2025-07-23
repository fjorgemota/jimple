"use strict";

function assert(ok, message) {
  if (!ok) {
    throw new Error(message);
  }
}

function toString(fn) {
  return Object.prototype.toString.call(fn);
}

function getConstructorName(fn) {
  return fn.constructor.name;
}

function isFunction(fn, type='') {
  return (
      toString(fn) === "[object Function]" &&
      getConstructorName(fn) === "Function"
  );
}

function isAsyncFunction(fn) {
  return (
      toString(fn) === "[object AsyncFunction]" &&
      getConstructorName(fn) === "AsyncFunction"
  );
}

function isPlainObject(value) {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }
  let prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

function checkDefined(container, key) {
  assert(container.has(key), `Identifier "${key}" is not defined.`);
}

function addFunctionTo(set, fn) {
  assert(
    isFunction(fn),
    "Service definition is not a Closure or invokable object"
  );
  set.add(fn);
  return fn;
}

function isProtected(container, key) {
  return key.length > 0 && key[0] !== "_" && isFunction(container[key]);
}

/**
 * The Jimple Container class
 *
 * @public
 */
class Jimple {
  /**
   * Create a Jimple Container.
   * @param {Object?} [values] - An optional object whose keys and values will be associated in the container at initialization
   */
  constructor(values) {
    this._items = new Map();
    this._instances = new Map();
    this._factories = new Set();
    this._protected = new Set();
    this._bind = this;
    values = isPlainObject(values) ? values : {};
    Object.entries(values).forEach(function (entry) {
      this.set(entry[0], entry[1]);
    }, this);
  }
  /**
   * Return the specified parameter or service. If the service is not built yet, this function will construct the service
   * injecting all the dependencies needed in it's definition so the returned object is totally usable on the fly.
   * @param {string} key - The key of the parameter or service to return
   * @return {*} The object related to the service or the value of the parameter associated with the key informed
   * @throws If the key does not exist
   */
  get(key) {
    checkDefined(this, key);
    let item = this._items.get(key);
    let obj = item;
    if (!this._protected.has(item) && (isFunction(item) || isAsyncFunction(item))) {
      if (this._instances.has(item)) {
        obj = this._instances.get(item);
      } else {
        obj = item(this._bind);
        if (!this._factories.has(item)) {
          this._instances.set(item, obj);
        }
      }
    }
    return obj;
  }
  /**
   * Defines a new parameter or service.
   * @param {string} key - The key of the parameter or service to be defined
   * @param {*} value - The value of the parameter or a function that receives the container as parameter and constructs the service
   */
  set(key, value) {
    this._items.set(key, value);
  }

  /**
   * Returns if a service or parameter with the informed key is already defined in the container.
   * @param {string} key - The key of the parameter or service to be checked.
   * @return {boolean} If the key exists in the container or not
   */
  has(key) {
    return this._items.has(key);
  }

  /**
   * Defines a service as a factory, so the instances are not cached in the service and that function is always called
   * @param {function(Jimple):*} fn - The function that constructs the service that is a factory
   * @return {function(Jimple):*} The same function passed as parameter
   */
  factory(fn) {
    return addFunctionTo(this._factories, fn);
  }

  /**
   * Defines a function as a parameter, so that function is not considered a service
   * @param {*} fn - The function to not be considered a service
   * @return {*} The same function passed as parameter
   */
  protect(fn) {
    return addFunctionTo(this._protected, fn);
  }

  /**
   * Return all the keys registered in the container
   * @returns {Array<string>}
   */
  keys() {
    return Array.from(this._items.keys());
  }

  /**
   * Extends a service already registered in the container
   * @param {string} key - The key of the service to be extended
   * @param {function(*, Jimple):*} fn - The function that will be used to extend the service
   * @throws If the key is not already defined
   * @throws If the key saved in the container does not correspond to a service
   * @throws If the function passed it not...well, a function
   */
  extend(key, fn) {
    checkDefined(this, key);
    let originalItem = this._items.get(key);
    assert(
      isFunction(originalItem) && this._protected.has(originalItem) === false,
      `Identifier '${key}' does not contain a service definition`
    );
    assert(
      isFunction(fn),
      `The 'new' service definition for '${key}' is not a invokable object.`
    );
    this.set(key, function (app) {
      return fn(originalItem(app), app);
    });
    if (this._factories.delete(originalItem)) {
      this._factories.add(this._items[key]);
    }
  }

  /**
   * Uses an provider to extend the service, so it's easy to split the service and parameter definitions across the system
   * @param {{register: function(Jimple)}} provider - The provider to be used to register services and parameters in this container
   */
  register(provider) {
    provider.register(this._bind);
  }

  /**
   * Returns the raw value of a service or parameter. So, in the case of a service, for example, the value returned is the
   * function used to construct the service.
   * @param {string} key - The key of the service or parameter to return.
   * @throws If the key does not exist in the container
   * @return {*} The raw value of the service or parameter
   */
  raw(key) {
    checkDefined(this, key);
    return this._items.get(key);
  }
}

function JimpleProxy(values) {
  let container = new Jimple(values);
  let bindCache = {};
  container._bind = new Proxy(container, {
    get(target, key) {
      if (!isProtected(target, key)) {
        return target.get(key);
      }
      if (!bindCache[key]) {
        bindCache[key] = container[key].bind(container);
      }
      return bindCache[key];
    },
    set(target, key, value) {
      assert(
        !isProtected(target, key),
        `Key '${key}' cannot be set because it's a protected method`
      );
      target.set(key, value);
      return true;
    },
    has(target, key) {
      return isProtected(target, key) ? key in target : target.has(key);
    },
  });
  return container._bind;
}

module.exports = JimpleProxy;
module.exports.provider = function (register) {
  return { register };
};
