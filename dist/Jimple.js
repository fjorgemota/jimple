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
        } else {
            var prototype = Object.getPrototypeOf(value);
            return prototype === null || prototype === Object.prototype;
        }
    }
    function checkDefined(container, key) {
        assert(container.has(key), "Identifier '" + key + "' is not defined.");
    }
    function addFunctionTo(set, fn) {
        assert(isFunction(fn), "Service definition is not a Closure or invokable object");
        set.add(fn);
        return fn;
    }

    var Jimple = function () {
        function Jimple(values) {
            _classCallCheck(this, Jimple);

            this.items = {};
            this.instances = new Map();
            this.factories = new Set();
            this.protected = new Set();
            values = isPlainObject(values) ? values : {};
            Object.keys(values).forEach(function (key) {
                this.set(key, values[key]);
            }, this);
        }

        _createClass(Jimple, [{
            key: "get",
            value: function get(key) {
                checkDefined(this, key);
                var item = this.items[key];
                var obj = void 0;
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
        }, {
            key: "set",
            value: function set(key, val) {
                this.items[key] = val;
            }
        }, {
            key: "has",
            value: function has(key) {
                return this.items.hasOwnProperty(key);
            }
        }, {
            key: "factory",
            value: function factory(fn) {
                return addFunctionTo(this.factories, fn);
            }
        }, {
            key: "protect",
            value: function protect(fn) {
                return addFunctionTo(this.protected, fn);
            }
        }, {
            key: "keys",
            value: function keys() {
                return Object.keys(this.items);
            }
        }, {
            key: "extend",
            value: function extend(key, fn) {
                checkDefined(this, key);
                var originalItem = this.items[key];
                assert(isFunction(originalItem) && this.protected.has(originalItem) === false, "Identifier '" + key + "' does not contain a service definition");
                assert(isFunction(fn), "The 'new' service definition for '" + key + "' is not a invokable object.");
                this.items[key] = function (app) {
                    return fn(originalItem(app), app);
                };
                if (this.factories.has(originalItem)) {
                    this.factories.delete(originalItem);
                    this.factories.add(this.items[key]);
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
                return this.items[key];
            }
        }]);

        return Jimple;
    }();

    module.exports = Jimple;
});