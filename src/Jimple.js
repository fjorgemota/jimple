"use strict";
function assert(ok, message) {
  if (!ok) {
    throw new Error(message)
  }
}
function isFunction(fn) {
    return Object.prototype.toString.call(fn) === "[object Function]" && fn.constructor.name === "Function";
}
function isPlainObject(value) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    } else {
        let prototype = Object.getPrototypeOf(value);
        return prototype === null || prototype === Object.prototype;
    }
}
function checkDefined(container, key) {
    assert(container.has(key), `Identifier '${key}' is not defined.`);
}
function addFunctionTo(set, fn) {
    assert(isFunction(fn), "Service definition is not a Closure or invokable object");
    set.add(fn);
    return fn;
}
class Jimple {
    constructor(values) {
        this.items = {};
        this.instances = new Map();
        this.factories = new Set();
        this.protected = new Set();
        values = isPlainObject(values) ? values : {};
        Object.keys(values).forEach(function(key) {
            this.set(key, values[key]);
        }, this);
    }
    get(key) {
        checkDefined(this, key);
        let item = this.items[key];
        let obj;
        if (isFunction(item)) {
            if (this.protected.has(item)) {
                obj = item;
            } else if (this.instances.has(item)) {
                obj = this.instances.get(item);
            } else {
                obj = item(this);
                if (!this.factories.has(item)) {
                    this.instances.set(item, obj);
                }
            }
        } else {
            obj = item;
        }
        return obj;
    }
    set(key, val) {
        this.items[key] = val;
    }
    has(key) {
        return this.items.hasOwnProperty(key);
    }
    factory(fn) {
        return addFunctionTo(this.factories, fn);
    }
    protect(fn) {
        return addFunctionTo(this.protected, fn);
    }
    keys() {
        return Object.keys(this.items);
    }
    extend(key, fn) {
        checkDefined(this, key);
        let originalItem = this.items[key];
        assert(isFunction(originalItem) && this.protected.has(originalItem) === false, `Identifier '${key}' does not contain a service definition`);
        assert(isFunction(fn), `The 'new' service definition for '${key}' is not a invokable object.`);
        this.items[key] = function(app) {
            return fn(originalItem(app), app);
        }
        if (this.factories.has(originalItem)) {
            this.factories.delete(originalItem);
            this.factories.add(this.items[key]);
        }
    }
    register(provider) {
        provider.register(this);
    }
    raw(key) {
        checkDefined(this, key);
        return this.items[key];
    }
}
module.exports = Jimple
