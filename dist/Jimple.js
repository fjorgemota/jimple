(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["module"], factory);
    } else if (typeof exports !== "undefined") {
        factory(module);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod);
        global.Jimple = mod.exports;
    }
})(this, function (module) {
    "use strict";

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function assert(ok, message) {
        if (!ok) {
            throw new Error(message);
        }
    }

    function isFunction(fn) {
        return Object.prototype.toString.call(fn) === "[object Function]" && fn.constructor.name === "Function";
    }

    function isPlainObject(value) {
        if (Object.prototype.toString.call(value) !== '[object Object]') {
            return false;
        }
        var prototype = Object.getPrototypeOf(value);
        return prototype === null || prototype === Object.prototype;
    }

    function checkDefined(container, key) {
        assert(container.has(key), "Identifier \"" + key + "\" is not defined.");
    }

    function addFunctionTo(set, fn) {
        assert(isFunction(fn), "Service definition is not a Closure or invokable object");
        set.add(fn);
        return fn;
    }

    /**
     * The Jimple Container class
     *
     * @public
     */

    var Jimple = function () {
        /**
         * Create a Jimple Container.
         * @param {Object?} [values] - An optional object whose keys and values will be associated in the container at initialization
         */
        function Jimple(values) {
            _classCallCheck(this, Jimple);

            this._items = {};
            this._instances = new Map();
            this._factories = new Set();
            this._protected = new Set();
            this._proxy = undefined;
            values = isPlainObject(values) ? values : {};
            Object.keys(values).forEach(function (key) {
                this.set(key, values[key]);
            }, this);
        }
        /**
         * Return the specified parameter or service. If the service is not built yet, this function will construct the service
         * injecting all the dependencies needed in it's definition so the returned object is totally usable on the fly.
         * @param {string} key - The key of the parameter or service to return
         * @return {*} The object related to the service or the value of the parameter associated with the key informed
         * @throws If the key does not exist
         */


        _createClass(Jimple, [{
            key: "get",
            value: function get(key) {
                checkDefined(this, key);
                var item = this._items[key];
                var obj = void 0;
                if (isFunction(item)) {
                    if (this._protected.has(item)) {
                        obj = item;
                    } else if (this._instances.has(item)) {
                        obj = this._instances.get(item);
                    } else {
                        obj = item(this._proxy ? this._proxy : this);
                        if (!this._factories.has(item)) {
                            this._instances.set(item, obj);
                        }
                    }
                } else {
                    obj = item;
                }
                return obj;
            }
        }, {
            key: "set",
            value: function set(key, value) {
                this._items[key] = value;
            }
        }, {
            key: "has",
            value: function has(key) {
                return this._items.hasOwnProperty(key);
            }
        }, {
            key: "factory",
            value: function factory(fn) {
                return addFunctionTo(this._factories, fn);
            }
        }, {
            key: "protect",
            value: function protect(fn) {
                return addFunctionTo(this._protected, fn);
            }
        }, {
            key: "keys",
            value: function keys() {
                return Object.keys(this._items);
            }
        }, {
            key: "extend",
            value: function extend(key, fn) {
                checkDefined(this, key);
                var originalItem = this._items[key];
                assert(isFunction(originalItem) && this._protected.has(originalItem) === false, "Identifier '" + key + "' does not contain a service definition");
                assert(isFunction(fn), "The 'new' service definition for '" + key + "' is not a invokable object.");
                this._items[key] = function (app) {
                    return fn(originalItem(app), app);
                };
                if (this._factories.has(originalItem)) {
                    this._factories.delete(originalItem);
                    this._factories.add(this._items[key]);
                }
            }
        }, {
            key: "register",
            value: function register(provider) {
                provider.register(this);
            }
        }, {
            key: "raw",
            value: function raw(key) {
                checkDefined(this, key);
                return this._items[key];
            }
        }], [{
            key: "proxy",
            value: function proxy(values) {
                assert(typeof Proxy !== "undefined", "The actual environment does not support ES6 Proxy");
                var container = new this();
                // The variable 'hasValues' exists because Proxy can only really proxy
                // attributes that EXIST on the object it is proxying.
                // So hasValues basically contains all container keys, and all methods
                // in the Container, in a way so we are able to respond correctly to
                // that attribute.
                var hasValues = {};
                // Methods contain a dynamic list of all the methods of the application
                // Which CANNOT be replaced in any way
                var methods = Object.getOwnPropertyNames(Object.getPrototypeOf(container)).filter(function (key) {
                    return isFunction(container[key]);
                });
                methods.forEach(function (key) {
                    return hasValues[key] = 1;
                });
                var result = new Proxy(hasValues, {
                    get: function get(obj, key) {
                        var value = methods.indexOf(key) > -1 ? container[key].bind(container) : container.get(key);
                        if (key === "set") {
                            return function (k, val) {
                                obj[k] = 1;
                                return value(k, val);
                            };
                        }
                        return value;
                    },
                    set: function set(obj, key, value) {
                        assert(methods.indexOf(key) === -1, "The key \"" + key + "\" isn't valid because it's the name of a method of the container");
                        obj[key] = 1;
                        container.set(key, value);
                        return true;
                    },
                    ownKeys: function ownKeys(obj) {
                        return container.keys();
                    },
                    has: function has(obj, key) {
                        return container.has(key);
                    },
                    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(obj, key) {
                        if (!obj[key]) {
                            return undefined;
                        }
                        var isPrivate = methods.indexOf(key) > -1;
                        return {
                            'configurable': !isPrivate,
                            'writable': !isPrivate,
                            'enumerable': !isPrivate,
                            'value': isPrivate ? container[key] : container.get(key)
                        };
                    }
                });
                container._proxy = result;
                values = isPlainObject(values) ? values : {};
                Object.keys(values).forEach(function (key) {
                    result[key] = values[key];
                });
                return result;
            }
        }]);

        return Jimple;
    }();

    module.exports = Jimple;
});