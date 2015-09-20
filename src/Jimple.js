"use strict";
function isFunction(fn) {
    return Object.prototype.toString.call(fn) == "[object Function]";
}
class Jimple { 
    constructor (values) {
        this.items = {};
        this.instances = new Map();
        this.factories = new Set();
        this.protected = new Set();
        var stringified = JSON.stringify(values);
        if (!stringified || (stringified[0] !== "{" && stringified[stringified.length-1] !== "}")) {
            values = {};
        }
        for (var key in values) {
            if (values.hasOwnProperty(key)) { 
                this.set(key, values[key]);
            }
        }
    }
    get (key) {
        if (!this.has(key)) {
             throw `Identifier '${key}' is not defined.`;
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
    set (key, val) {
         this.items[key] = val;
    }
    has (key) {
         return this.items.hasOwnProperty(key);
    }
    factory (fn) {
         if (!isFunction(fn)) {
             throw "Service definition is not a Closure or invokable object";
         }
         this.factories.add(fn);
         return fn;
    }
    protect (fn) {
         if (!isFunction(fn)) {
             throw "Callable is not a Closure or invokable object";
         }
         this.protected.add(fn);
         return fn;
    }
    keys () {
         var results = [];
         for (var key in this.items) {
             if (this.items.hasOwnProperty(key)) {
                 results.push(key);
             }
         }
         return results;
    }
    extend (key, fn) {
         if (!this.has(key)) {
             throw `Identifier '${key}' is not defined.`;
         }
         var originalItem = this.items[key]; 
         if (!isFunction(originalItem)) {
             throw `Identifier '${key}' does not contain an object definition`;
         }
         if (!isFunction(fn)) {
             throw "Extension service definition is not a invokable object.";
         }
         this.items[key] = function(app) {
             return fn(originalItem(app), app);
         }
         if (this.factories.has(originalItem)) {
             this.factories.delete(originalItem);
             this.factories.add(this.items[key]);
         }
     }
     register (provider) {
         provider.register(this);
     }
     raw (key) {
         if (!this.has(key)) {
            throw `Identifier '${key}' is not defined`;
         }
         return this.items[key];
     }
}
module.exports = Jimple
