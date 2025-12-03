"use strict";
import { describe, it, expect } from "vitest";
import Jimple, { JimpleWithProxy } from "./Jimple";

describe("Jimple", function () {
  describe("#constructor()", function () {
    it("should support passing no parameters", function () {
      const jimple = new Jimple();
      expect(jimple).toBeInstanceOf(Jimple);
      expect(jimple.keys()).toHaveLength(0);
    });
    it("should support passing some parameters", function () {
      const jimple = new Jimple({
        name: "xpto",
        age: 19,
      });
      expect(jimple.keys()).toContain("name");
      expect(jimple.keys()).toContain("age");
      expect(jimple.get("name")).toBe("xpto");
      expect(jimple.get("age")).toBe(19);
    });
    it("should support passing some services", function () {
      interface NServiceMap {
        n: number;
        n2: number;
      }
      const jimple = new Jimple<NServiceMap>({
        n2: function (app) {
          return app.get("n") + 1;
        },
        n: function () {
          return 19;
        },
      });
      expect(jimple.keys()).toContain("n");
      expect(jimple.keys()).toContain("n2");
      expect(jimple.get("n2")).toBe(20);
      expect(jimple.get("n")).toBe(19);
      expect(jimple.raw("n")).toBeTypeOf("function");
    });
    it("should support passing some services and parameters", function () {
      interface NServiceMap {
        n: number;
        n2: number;
      }
      const jimple = new Jimple<NServiceMap>({
        n2: function (app) {
          return app.get("n") + 1;
        },
        n: 19,
      });
      expect(jimple.keys()).toContain("n");
      expect(jimple.keys()).toContain("n2");
      expect(jimple.get("n2")).toBe(20);
      expect(jimple.get("n")).toBe(19);
      expect(jimple.raw("n")).toBe(19);
    });
  });
  describe("#get()", function () {
    it("should throw an exception when getting non existent key", function () {
      interface EmptyServiceMap {}
      const jimple = new Jimple<EmptyServiceMap>();
      expect(function () {
        // @ts-ignore
        jimple.get("non-existent-key");
      }).toThrow();
    });
    it("should support getting parameters", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>({
        age: 19,
        name: "xpto",
      });
      expect(jimple.get("age")).toBe(19);
      expect(jimple.get("name")).toBe("xpto");
    });
    it("should treat generator function as parameters", function () {
      interface GeneratorServiceMap {
        age: () => Generator<number>;
      }
      const jimple = new Jimple<GeneratorServiceMap>({
        age: function* () {
          yield 19;
        },
      });
      expect(jimple.get("age")).not.toEqual(19);
      const it = jimple.get("age")();
      expect(it.next()).toEqual({
        value: 19,
        done: false,
      });
      expect(it.next()).toEqual({
        value: undefined,
        done: true,
      });
    });
    it("should treat async function as parameters", async function () {
      interface GeneratorServiceMap {
        age: Promise<number>;
      }
      const jimple = new Jimple<GeneratorServiceMap>({
        age: async function () {
          return 19;
        },
      });
      expect(jimple.get("age")).not.toEqual(19);
      expect(await jimple.get("age")).toEqual(19);
    });
    it("should support getting services", function () {
      interface ParameterServiceMap {
        age: number;
      }
      const jimple = new Jimple<ParameterServiceMap>({
        age: function () {
          return 19;
        },
      });
      expect(jimple.get("age")).toBe(19);
    });
    it("should cache values of the services", function () {
      interface SymbolServiceMap {
        symbol: () => symbol;
      }
      const jimple = new Jimple<SymbolServiceMap>({
        symbol: () => Symbol(),
      });
      expect(jimple.get("symbol")).toBe(jimple.get("symbol"));
    });
    it("should not cache values of factories", function () {
      interface SymbolServiceMap {
        symbol: () => symbol;
      }
      const jimple = new Jimple<SymbolServiceMap>();
      jimple.set(
        "symbol",
        // @ts-ignore
        jimple.factory(() => Symbol()),
      );
      expect(jimple.get("symbol")).not.toEqual(jimple.get("symbol"));
    });
    it("should return raw values of protected closures", function () {
      interface SymbolServiceMap {
        symbol: () => Symbol;
      }
      const jimple = new Jimple<SymbolServiceMap>();
      jimple.set("symbol", jimple.protect(Symbol));
      expect(jimple.get("symbol")).toBe(Symbol);
    });
  });
  describe("#set()", function () {
    it("should support saving parameters", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", 19);
      jimple.set("name", "xpto");
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toContain("name");
      expect(jimple.get("age")).toBe(19);
      expect(jimple.get("name")).toBe("xpto");
    });
    it("should support saving services", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", function () {
        return 19;
      });
      jimple.set("name", function () {
        return "xpto";
      });
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toContain("name");
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.has("name")).toBeTruthy();
      expect(jimple.get("age")).toBe(19);
      expect(jimple.get("name")).toBe("xpto");
    });
    it("should throw an error if overwriting services already instantiated", function () {
      interface ParameterServiceMap {
        age: number;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", function () {
        return 19;
      });
      expect(jimple.keys()).toContain("age");
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.get("age")).toBe(19);
      expect(() => {
        jimple.set("age", function () {
          return 20;
        });
      }).toThrow();
      expect(jimple.get("age")).toBe(19);
    });
    it("should work fine if overwriting services not already instantiated", function () {
      interface ParameterServiceMap {
        age: number;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", function () {
        return 19;
      });
      expect(jimple.keys()).toContain("age");
      jimple.set("age", function () {
        return 20;
      });
      expect(jimple.get("age")).toBe(20);
    });
  });
  describe("#unset()", function () {
    it("should support unsetting parameters", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", 19);
      jimple.set("name", "xpto");
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toContain("name");
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.has("name")).toBeTruthy();
      jimple.unset("age");
      expect(jimple.keys()).not.toContain("age");
      expect(jimple.keys()).toContain("name");
      expect(jimple.has("age")).toBeFalsy();
      expect(jimple.has("name")).toBeTruthy();
      jimple.unset("name");
      expect(jimple.keys()).not.toContain("age");
      expect(jimple.keys()).not.toContain("name");
      expect(jimple.has("age")).toBeFalsy();
      expect(jimple.has("name")).toBeFalsy();
    });

    it("should support unsetting services", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", function () {
        return 19;
      });
      jimple.set("name", function () {
        return "xpto";
      });
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toContain("name");
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.has("name")).toBeTruthy();
      jimple.unset("age");
      expect(jimple.keys()).not.toContain("age");
      expect(jimple.keys()).toContain("name");
      expect(jimple.has("age")).toBeFalsy();
      expect(jimple.has("name")).toBeTruthy();
      jimple.unset("name");
      expect(jimple.keys()).not.toContain("age");
      expect(jimple.keys()).not.toContain("name");
      expect(jimple.has("age")).toBeFalsy();
      expect(jimple.has("name")).toBeFalsy();
    });
  });
  describe("#raw()", function () {
    it("should throw an exception when getting non existent key", function () {
      interface EmptyServiceMap {}
      const jimple = new Jimple<EmptyServiceMap>();
      expect(function () {
        // @ts-ignore
        jimple.raw("non-existent-key");
      }).toThrow();
    });
    it("should return raw parameters", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", 19);
      jimple.set("name", "xpto");
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toContain("name");
      expect(jimple.raw("age")).toBe(19);
      expect(jimple.raw("name")).toBe("xpto");
    });
    it("should return raw services", function () {
      interface RawServiceMap {
        age: number;
        symbol: () => symbol;
      }
      const jimple = new Jimple<RawServiceMap>();
      const s = () => Symbol();
      jimple.set("symbol", s);
      jimple.set("age", function () {
        return 19;
      });
      expect(jimple.keys()).toContain("symbol");
      expect(jimple.keys()).toContain("age");
      expect(jimple.get("age")).toBe(19);
      const rawAge = jimple.raw("age");
      expect(rawAge).toBeTypeOf("function");
      expect((rawAge as Function)()).toBe(19);
      expect(jimple.get("symbol")).toBe(jimple.get("symbol"));
      expect(jimple.raw("symbol")).toBe(s);
    });
  });
  describe("#factory()", function () {
    it("should throw exception if parameter is passed in", function () {
      const jimple = new Jimple();
      expect(function () {
        // @ts-ignore
        jimple.factory(19);
      }).toThrow();
      expect(function () {
        // @ts-ignore
        jimple.factory("xpto");
      }).toThrow();
    });
    it("should not throw exceptions if function is passed in", function () {
      const jimple = new Jimple();
      expect(function () {
        // @ts-ignore
        jimple.factory(() => Symbol());
      }).not.toThrow();
      expect(function () {
        // @ts-ignore
        jimple.factory(function () {
          return "xpto";
        });
      }).not.toThrow();
    });
    it("should return unmodified function", function () {
      const jimple = new Jimple();
      const fn = function () {
        return "xpto";
      };
      // @ts-ignore
      expect(jimple.factory(Symbol)).toBe(Symbol);
      // @ts-ignore
      expect(jimple.factory(fn)).toBe(fn);
    });
  });
  describe("#protect()", function () {
    it("should throw exception if parameter is passed in", function () {
      const jimple = new Jimple();
      expect(function () {
        // @ts-ignore
        jimple.protect(19);
      }).toThrow();
      expect(function () {
        // @ts-ignore
        jimple.protect("xpto");
      }).toThrow();
    });
    it("should not throw exceptions if function is passed in", function () {
      const jimple = new Jimple();
      expect(function () {
        jimple.protect(Symbol);
      }).not.toThrow();
      expect(function () {
        jimple.protect(function () {
          return "xpto";
        });
      }).not.toThrow();
    });
    it("should return unmodified function", function () {
      const jimple = new Jimple();
      const fn = function () {
        return "xpto";
      };
      expect(jimple.protect(Symbol)).toBe(Symbol);
      expect(jimple.protect(fn)).toBe(fn);
    });
  });
  describe("#keys()", function () {
    it("should return keys of parameters", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      expect(jimple.keys()).toHaveLength(0);
      jimple.set("age", 19);
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toHaveLength(1);
      jimple.set("name", "xpto");
      expect(jimple.keys()).toHaveLength(2);
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toContain("name");
    });
    it("should return keys of services", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      expect(jimple.keys()).toHaveLength(0);
      jimple.set("age", function () {
        return 19;
      });
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toHaveLength(1);
      jimple.set("name", function () {
        return "xpto";
      });
      expect(jimple.keys()).toHaveLength(2);
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toContain("name");
    });
    it("should return keys of services and parameters", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      expect(jimple.keys()).toHaveLength(0);
      jimple.set("age", 19);
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toHaveLength(1);
      jimple.set("name", function () {
        return "xpto";
      });
      expect(jimple.keys()).toHaveLength(2);
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toContain("name");
    });
  });
  describe("#has()", function () {
    it("should recognize parameters", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      expect(jimple.has("age")).toBeFalsy();
      expect(jimple.has("name")).toBeFalsy();
      jimple.set("age", 19);
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.has("name")).toBeFalsy();
      jimple.set("name", "xpto");
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.has("name")).toBeTruthy();
    });
    it("should recognize services", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      expect(jimple.has("age")).toBeFalsy();
      expect(jimple.has("name")).toBeFalsy();
      jimple.set("age", function () {
        return 19;
      });
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.has("name")).toBeFalsy();
      jimple.set("name", function () {
        return "xpto";
      });
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.has("name")).toBeTruthy();
    });
    it("should return keys of services and parameters", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      expect(jimple.has("age")).toBeFalsy();
      expect(jimple.has("name")).toBeFalsy();
      jimple.set("age", 19);
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.has("name")).toBeFalsy();
      jimple.set("name", function () {
        return "xpto";
      });
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.has("name")).toBeTruthy();
    });
  });
  describe("#register()", function () {
    it("should call register() method on object", function () {
      interface EmptyServiceMap {}
      const jimple = new Jimple<EmptyServiceMap>();
      let called = false;
      const provider = {
        register: function (app: Jimple) {
          expect(app).toBe(jimple);
          called = true;
        },
      };
      jimple.register(provider);
      expect(called).toBeTruthy();
    });
  });
  describe("#registerAsync()", function () {
    it("should call registerAsync() method on object", async function () {
      interface EmptyServiceMap {}
      const jimple = new Jimple<EmptyServiceMap>();
      let called = false;
      const provider = {
        registerAsync: async function (app: Jimple): Promise<void> {
          expect(app).toBe(jimple);
          called = true;
        },
      };
      expect(called).toBeFalsy();
      await jimple.registerAsync(provider);
      expect(called).toBeTruthy();
    });
  });
  describe("#extend()", function () {
    it("should throw an error on non-existent key", function () {
      interface EmptyServiceMap {}
      const jimple = new Jimple<EmptyServiceMap>();
      expect(function () {
        // @ts-ignore
        jimple.extend("not-found-key", function () {});
      }).toThrow();
    });
    it("should throw an error on parameter key", function () {
      interface ParameterServiceMap {
        age: number;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", 19);
      expect(function () {
        jimple.extend("age", function (): number {
          return 42;
        });
      }).toThrow();
    });
    it("should throw an error on protected key", function () {
      interface ParameterServiceMap {
        theAnswer: number;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set(
        "theAnswer",
        jimple.protect(function () {
          return 42;
        }),
      );
      expect(function () {
        jimple.extend("theAnswer", function () {
          return 41;
        });
      }).toThrow();
    });
    it("should throw an error on invalid callable", function () {
      interface ParameterServiceMap {
        age: number;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", function () {
        return 19;
      });
      expect(function () {
        // @ts-ignore
        jimple.extend("age", 1);
      }).toThrow();
    });
    it("should throw an error if service was already instantiated", function () {
      interface ParameterServiceMap {
        age: number;
        one: number;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", function () {
        return 19;
      });
      jimple.set("one", 1);
      expect(jimple.get("age")).toBe(19);
      expect(() => {
        jimple.extend("age", function (result, app) {
          return result + app.get("one");
        });
      }).toThrow();
      expect(jimple.get("age")).toBe(19);
    });
    it("should overwrite service correctly", function () {
      interface ParameterServiceMap {
        age: number;
        one: number;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("age", function () {
        return 19;
      });
      jimple.set("one", 1);
      jimple.extend("age", function (result, app) {
        return result + app.get("one");
      });
      expect(jimple.get("age")).toBe(20);
    });
    it("should call extenders in expected order", function () {
      interface ParameterServiceMap {
        n: number;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("n", function () {
        return 1;
      });
      jimple.extend("n", function (result, app) {
        expect(result).toBe(1);
        return 3;
      });
      jimple.extend("n", function (result, app) {
        expect(result).toBe(3);
        return 5;
      });
      jimple.extend("n", function (result, app) {
        expect(result).toBe(5);
        return 9;
      });
      expect(jimple.get("n")).toBe(9);
    });
    it("should never hit the stack limit", function () {
      interface ParameterServiceMap {
        n: number;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      jimple.set("n", function () {
        return 1;
      });
      for (let i = 0; i < 20000; i++) {
        jimple.extend("n", function (result, app) {
          expect(result).toBe(i + 1);
          return result + 1;
        });
      }
      expect(jimple.get("n")).toBe(20001);
    });
    it("should update factories correctly", function () {
      interface ParameterServiceMap {
        age: number;
        one: number;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      let counter = 0;
      jimple.set(
        "age",
        jimple.factory(function () {
          return 19 + counter++;
        }),
      );
      jimple.set("one", 1);
      expect(jimple.get("age")).toBe(19);
      expect(jimple.get("age")).toBe(20);
      jimple.extend("age", function (result, app) {
        return result + app.get("one");
      });
      expect(jimple.get("age")).toBe(22);
    });
  });
  describe("#provider()", function () {
    it("should register a provider created by the shorthand static method", function () {
      const jimple = new Jimple();
      let called = false;
      const provider = Jimple.provider(function (app) {
        expect(app).toBe(jimple);
        called = true;
      });
      jimple.register(provider);
      expect(called).toBeTruthy();
    });
  });
  describe("#providerAsync()", function () {
    it("should register an asynchronous provider created by the shorthand static method", async function () {
      const jimple = new Jimple();
      let called = false;
      const provider = Jimple.providerAsync(async function (app) {
        expect(app).toBe(jimple);
        called = true;
      });
      expect(called).toBeFalsy();
      await jimple.registerAsync(provider);
      expect(called).toBeTruthy();
    });
  });
  describe("#proxy", function () {
    it("should allows accessing parameters as properties", function () {
      interface ParameterServiceMap {
        name: string;
        age: number;
      }
      const jimple = Jimple.create<ParameterServiceMap>({
        name: "xpto",
        age: 19,
      });
      expect(jimple.name).toBe("xpto");
      expect(jimple.age).toBe(19);
    });
    it("should allows accessing services as properties", function () {
      interface ParameterServiceMap {
        age: number;
        one: number;
        nextAge: number;
        notDefined: undefined;
      }
      const jimple = Jimple.create<ParameterServiceMap>({
        age: () => 19,
        one: 1,
        nextAge: (j) => j.age + j.one,
        notDefined: undefined,
      });
      expect(jimple.nextAge).toBe(20);
    });
    it("Should throw an error when trying to access non-existent key", function () {
      interface EmptyServiceMap {}
      const jimple = Jimple.create<EmptyServiceMap>();
      expect(function () {
        // @ts-ignore
        jimple.nonExistentKey;
      }).toThrow();
      expect(function () {
        // @ts-ignore
        jimple._items;
      }).toThrow();
    });
    it("should allow setting services and properties after initialization", function () {
      interface ParameterServiceMap {
        age: number;
        one: number;
        nextAge: number;
      }
      const jimple = Jimple.create<ParameterServiceMap>();
      // @ts-ignore
      jimple.age = () => 19;
      // @ts-ignore
      jimple.one = 1;
      // @ts-ignore
      jimple.nextAge = (j) => j.age + j.one;
      expect(jimple.nextAge).toBe(20);
    });

    it("should allow unsetting services and properties after initialization", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = Jimple.create<ParameterServiceMap>();
      // @ts-ignore
      jimple.age = () => 19;
      // @ts-ignore
      jimple.name = "xpto";
      expect(jimple.has("age")).toBeTruthy();
      expect(jimple.has("name")).toBeTruthy();
      // @ts-ignore
      delete jimple.age;
      expect(jimple.has("age")).toBeFalsy();
      expect(jimple.has("name")).toBeTruthy();
      // @ts-ignore
      delete jimple.name;
      expect(jimple.has("age")).toBeFalsy();
      expect(jimple.has("name")).toBeFalsy();
    });
    it("should throw an error when trying to set a method or private parameter", function () {
      const jimple = Jimple.create();
      expect(function () {
        // @ts-ignore
        jimple.keys = () => [];
      }).toThrow();
      expect(function () {
        // @ts-ignore
        jimple._items = 42;
      }).toThrow();
    });
    it("should throw an error when trying to delete a method or private parameter", function () {
      const jimple = Jimple.create();
      expect(function () {
        // @ts-ignore
        delete jimple.keys;
      }).toThrow();
      expect(function () {
        // @ts-ignore
        delete jimple._items;
      }).toThrow();
    });
    it("should be able to check if a property exists", function () {
      interface ParameterServiceMap {
        name: string;
      }
      const jimple = Jimple.create<ParameterServiceMap>({
        name: "xpto",
      });
      expect("set" in jimple).toBe(true);
      expect("name" in jimple).toBe(true);
      expect("age" in jimple).toBe(false);
    });
    it("should be able to list keys", function () {
      interface ParameterServiceMap {
        name: string;
        age: number;
      }
      const jimple = Jimple.create<ParameterServiceMap>({
        name: "xpto",
        age: 19,
      });
      expect(Object.keys(jimple)).toContain("name");
      expect(Object.keys(jimple)).toContain("age");
    });
    it("should return property descriptor for properties", function () {
      interface ParameterServiceMap {
        name: string;
      }
      const jimple = Jimple.create<ParameterServiceMap>({
        name: "xpto",
      });
      const setDescriptor = Object.getOwnPropertyDescriptor(jimple, "set");
      expect(setDescriptor).toBeUndefined();
      const nameDescriptor = Object.getOwnPropertyDescriptor(jimple, "name");
      expect(nameDescriptor).toBeDefined();
      expect(nameDescriptor?.get).toBeDefined();
      expect(nameDescriptor?.get!()).toBe("xpto");
      nameDescriptor?.set!("name");
      expect(nameDescriptor?.get!()).toBe("name");
      expect(nameDescriptor?.enumerable).toBe(true);
      expect(nameDescriptor?.configurable).toBe(true);
      const nonExistentDescriptor = Object.getOwnPropertyDescriptor(
        jimple,
        "non_existent_key",
      );
      expect(nonExistentDescriptor).toBeUndefined();
    });
    it("should support protect()", function () {
      interface ParameterServiceMap {
        age: number;
        one: number;
        nextAge: number;
      }
      const v = (j: JimpleWithProxy<ParameterServiceMap>) => j.age + j.one;
      const jimple = Jimple.create<ParameterServiceMap>();
      // @ts-ignore
      jimple.age = () => 19;
      // @ts-ignore
      jimple.one = 1;
      // @ts-ignore
      jimple.nextAge = jimple.protect(v);
      expect(jimple.nextAge).toBe(v);
    });
    it("should support factory()", function () {
      interface SymbolServiceMap {
        symbol: () => symbol;
        cachedSymbol: () => symbol;
      }
      const jimple = Jimple.create<SymbolServiceMap>();
      // @ts-ignore
      jimple.symbol = jimple.factory(() => Symbol());
      // @ts-ignore
      jimple.cachedSymbol = () => Symbol();
      expect(jimple.symbol).not.toEqual(jimple.symbol);
      expect(jimple.cachedSymbol).toEqual(jimple.cachedSymbol);
    });
    it("should support raw()", function () {
      interface ParameterServiceMap {
        age: number;
        one: number;
        nextAge: number;
      }
      const v = (j: JimpleWithProxy<ParameterServiceMap>) => j.age + j.one;
      const jimple = Jimple.create<ParameterServiceMap>();
      // @ts-ignore
      jimple.age = () => 19;
      // @ts-ignore
      jimple.one = 1;
      // @ts-ignore
      jimple.nextAge = v;
      expect(jimple.nextAge).toBe(20);
      expect(jimple.raw("nextAge")).toBe(v);
    });
  });
});
