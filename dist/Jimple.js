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

    function isFunction(fn) {
        return Object.prototype.toString.call(fn) === "[object Function]";
    }

    var Jimple = function () {
        function Jimple(values) {
            _classCallCheck(this, Jimple);

            this.items = {};
            this.instances = new Map();
            this.factories = new Set();
            this.protected = new Set();
            var stringified = JSON.stringify(values);
            if (!stringified || stringified[0] !== "{" && stringified[stringified.length - 1] !== "}") {
                values = {};
            }
            for (var key in values) {
                if (values.hasOwnProperty(key)) {
                    this.set(key, values[key]);
                }
            }
        }

        _createClass(Jimple, [{
            key: "get",
            value: function get(key) {
                if (!this.has(key)) {
                    throw "Identifier '" + key + "' is not defined.";
                }
                var item = this.items[key];
                var obj;
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
                if (!isFunction(fn)) {
                    throw "Service definition is not a Closure or invokable object";
                }
                this.factories.add(fn);
                return fn;
            }
        }, {
            key: "protect",
            value: function protect(fn) {
                if (!isFunction(fn)) {
                    throw "Callable is not a Closure or invokable object";
                }
                this.protected.add(fn);
                return fn;
            }
        }, {
            key: "keys",
            value: function keys() {
                var results = [];
                for (var key in this.items) {
                    if (this.items.hasOwnProperty(key)) {
                        results.push(key);
                    }
                }
                return results;
            }
        }, {
            key: "extend",
            value: function extend(key, fn) {
                if (!this.has(key)) {
                    throw "Identifier '" + key + "' is not defined.";
                }
                var originalItem = this.items[key];
                if (!isFunction(originalItem)) {
                    throw "Identifier '" + key + "' does not contain an object definition";
                }
                if (!isFunction(fn)) {
                    throw "Extension service definition is not a invokable object.";
                }
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
                if (!this.has(key)) {
                    throw "Identifier '" + key + "' is not defined";
                }
                return this.items[key];
            }
        }]);

        return Jimple;
    }();

    module.exports = Jimple;
});