"use strict";

/**
 * A function that receives a container and returns an object corresponding to a service
 * @callback Jimple~serviceConstructor
 * @param {Jimple} c - The container used to get other parameters and services needed to construct the new service
 * @return {} A value corresponding to a service
 */

/**
 * A function that receives the old service and the container and extends the service, returning the new value corresponding to that service
 * @callback Jimple~serviceExtender
 * @param {} service - The value corresponding to the old service
 * @param {Jimple} c - The container used to get other parameters and services needed to extend the service
 * @return {} A value corresponding to the new value of the service
 */

/**
 * A function that will be used to register new services and parameters in the container
 * @callback Jimple~provider
 * @param {Jimple} c - The container used to set new services and parameters
 */

/**
 * A object that has a register method that receives a container and is able to extend that container
 * @typedef Jimple~containerProvider
 * @property {Jimple~provider} register - A function that will be called to register new services and parameters in the container
 */


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
    }
    let prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.prototype;
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
    /**
     * Create a Jimple Container.
     * @param {Object} [values] - An optional object whose keys and values will be associated in the container at initialization
     */
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
    /**
     * Return the specified parameter or service. If the service is not built yet, this function will construct the service
     * injecting all the dependencies needed in it's definition so the returned object is totally usable on the fly.
     * @param {string} key - The key of the parameter or service to return
     * @return {} The object related to the service or the value of the parameter associated with the key informed
     * @throws If the key does not exist
     */
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
    /**
     * Defines a new parameter or service.
     * @param {string} key - The key of the parameter or service to be defined
     * @param {} value - The value of the parameter or a function that receives the container as parameter and constructs the service
     */
    set(key, val) {
        this.items[key] = val;
    }
    /**
     * Returns if a service or parameter with the informed key is already defined in the container.
     * @param {string} key - The key of the parameter or service to be checked.
     * @return {boolean} If the key exists in the container or not
     */
    has(key) {
        return this.items.hasOwnProperty(key);
    }
    /**
     * Defines a service as a factory, so the instances are not cached in the service and that function is always called
     * @param {Jimple~serviceConstructor} fn - The function that constructs the service that is a factory
     * @return {Jimple~serviceConstructor} The same function passed as parameter
     */
    factory(fn) {
        return addFunctionTo(this.factories, fn);
    }
    /**
     * Defines a function as a parameter, so that function is not considered a service
     * @param {function} fn - The function to not be considered a service
     * @return {function} The same function passed as parameter
     */
    protect(fn) {
        return addFunctionTo(this.protected, fn);
    }
    /**
     * Return all the keys registered in the container
     * @returns {Array.string}
     */
    keys() {
        return Object.keys(this.items);
    }
    /**
     * Extends a service already registered in the container
     * @param {string} key - The key of the service to be extended
     * @param {Jimple~serviceExtender} fn - The function that will be used to extend the service
     * @throws If the key is not already defined
     * @throws If the key saved in the container does not correspond to a service
     * @throws If the function passed it not...well, a function
     */
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
    /**
     * Uses an provider to extend the service, so it's easy to split the service and parameter definitions across the system
     * @param {Jimple~containerProvider} provider - The provider to be used to register services and parameters in this container
     */
    register(provider) {
        provider.register(this);
    }
    /**
     * Returns the raw value of a service or parameter. So, in the case of a service, for example, the value returned is the
     * function used to construct the service.
     * @param {string} key - The key of the service or parameter to return.
     * @throws If the key does not exist in the container
     * @return {}
     */
    raw(key) {
        checkDefined(this, key);
        return this.items[key];
    }
}

module.exports = Jimple;
