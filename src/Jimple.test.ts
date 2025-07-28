"use strict";
import { describe, it, expect } from "vitest";
import Jimple, { JimpleWithProxy } from "./Jimple";

describe("Jimple", function () {
  describe("#constructor()", function () {
    it("should support passing no parameters", function () {
      const jimple = new Jimple();
      expect(jimple).to.be.an.instanceof(Jimple);
      expect(jimple.keys()).to.be.empty;
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
      expect(jimple.raw("n")).to.be.a("function");
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
      }).to.throw();
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
      expect(jimple.get("age")).to.not.equal(19);
      const it = jimple.get("age")();
      expect(it.next()).to.eql({
        value: 19,
        done: false,
      });
      expect(it.next()).to.eql({
        value: undefined,
        done: true,
      });
    });
    it("should treat async function as parameters", async function (ctx) {
      interface GeneratorServiceMap {
        age: Promise<number>;
      }
      const jimple = new Jimple<GeneratorServiceMap>({
        age: async function () {
          return 19;
        },
      });
      expect(jimple.get("age")).to.not.equal(19);
      expect(await jimple.get("age")).to.equal(19);
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
      jimple.set("symbol", jimple.factory(() => Symbol()));
      expect(jimple.get("symbol")).to.not.equal(jimple.get("symbol"));
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
      expect(jimple.has("age")).to.be.ok;
      expect(jimple.has("name")).to.be.ok;
      expect(jimple.get("age")).toBe(19);
      expect(jimple.get("name")).toBe("xpto");
    });
  });
  describe("#raw()", function () {
    it("should throw an exception when getting non existent key", function () {
      interface EmptyServiceMap {}
      const jimple = new Jimple<EmptyServiceMap>();
      expect(function () {
        // @ts-ignore
        jimple.raw("non-existent-key");
      }).to.throw();
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
      expect(rawAge).to.be.a("function");
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
      }).to.throw();
      expect(function () {
        // @ts-ignore
        jimple.factory("xpto");
      }).to.throw();
    });
    it("should not throw exceptions if function is passed in", function () {
      const jimple = new Jimple();
      expect(function () {
        jimple.factory(Symbol);
      }).to.not.throw();
      expect(function () {
        jimple.factory(function () {
          return "xpto";
        });
      }).to.not.throw();
    });
    it("should return unmodified function", function () {
      const jimple = new Jimple();
      const fn = function () {
        return "xpto";
      };
      expect(jimple.factory(Symbol)).toBe(Symbol);
      expect(jimple.factory(fn)).toBe(fn);
    });
  });
  describe("#protect()", function () {
    it("should throw exception if parameter is passed in", function () {
      const jimple = new Jimple();
      expect(function () {
        // @ts-ignore
        jimple.protect(19);
      }).to.throw();
      expect(function () {
        // @ts-ignore
        jimple.protect("xpto");
      }).to.throw();
    });
    it("should not throw exceptions if function is passed in", function () {
      const jimple = new Jimple();
      expect(function () {
        jimple.protect(Symbol);
      }).to.not.throw();
      expect(function () {
        jimple.protect(function () {
          return "xpto";
        });
      }).to.not.throw();
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
      expect(jimple.keys()).to.be.empty;
      jimple.set("age", 19);
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).to.have.length(1);
      jimple.set("name", "xpto");
      expect(jimple.keys()).to.have.length(2);
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toContain("name");
    });
    it("should return keys of services", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      expect(jimple.keys()).to.be.empty;
      jimple.set("age", function () {
        return 19;
      });
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).to.have.length(1);
      jimple.set("name", function () {
        return "xpto";
      });
      expect(jimple.keys()).to.have.length(2);
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).toContain("name");
    });
    it("should return keys of services and parameters", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      expect(jimple.keys()).to.be.empty;
      jimple.set("age", 19);
      expect(jimple.keys()).toContain("age");
      expect(jimple.keys()).to.have.length(1);
      jimple.set("name", function () {
        return "xpto";
      });
      expect(jimple.keys()).to.have.length(2);
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
      expect(jimple.has("age")).to.not.be.ok;
      expect(jimple.has("name")).to.not.be.ok;
      jimple.set("age", 19);
      expect(jimple.has("age")).to.be.ok;
      expect(jimple.has("name")).to.not.be.ok;
      jimple.set("name", "xpto");
      expect(jimple.has("age")).to.be.ok;
      expect(jimple.has("name")).to.be.ok;
    });
    it("should recognize services", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      expect(jimple.has("age")).to.not.be.ok;
      expect(jimple.has("name")).to.not.be.ok;
      jimple.set("age", function () {
        return 19;
      });
      expect(jimple.has("age")).to.be.ok;
      expect(jimple.has("name")).to.not.be.ok;
      jimple.set("name", function () {
        return "xpto";
      });
      expect(jimple.has("age")).to.be.ok;
      expect(jimple.has("name")).to.be.ok;
    });
    it("should return keys of services and parameters", function () {
      interface ParameterServiceMap {
        age: number;
        name: string;
      }
      const jimple = new Jimple<ParameterServiceMap>();
      expect(jimple.has("age")).to.not.be.ok;
      expect(jimple.has("name")).to.not.be.ok;
      jimple.set("age", 19);
      expect(jimple.has("age")).to.be.ok;
      expect(jimple.has("name")).to.not.be.ok;
      jimple.set("name", function () {
        return "xpto";
      });
      expect(jimple.has("age")).to.be.ok;
      expect(jimple.has("name")).to.be.ok;
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
      expect(called).to.be.ok;
    });
  });
  describe("#extend()", function () {
    it("should throw an error on non-existent key", function () {
      interface EmptyServiceMap {}
      const jimple = new Jimple<EmptyServiceMap>();
      expect(function () {
        // @ts-ignore
        jimple.extend("not-found-key", function () {});
      }).to.throw();
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
      }).to.throw();
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
      }).to.throw();
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
      }).to.throw();
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
      expect(jimple.get("age")).toBe(19);
      jimple.extend("age", function (result, app) {
        return result + app.get("one");
      });
      expect(jimple.get("age")).toBe(20);
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
      expect(called).to.be.ok;
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
        }).to.throw();
        expect(function () {
          // @ts-ignore
          jimple._items;
        }).to.throw();
    })
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
    it("should throw an error when trying to set a method or private parameter", function () {
      const jimple = Jimple.create();
      expect(function () {
        // @ts-ignore
        jimple.keys = () => [];
      }).to.throw();
      expect(function () {
        // @ts-ignore
        jimple._items = 42;
      }).to.throw();
    });
    it("should be able to check if a property exists", function () {
      interface ParameterServiceMap {
        name: string;
      }
      const jimple = Jimple.create<ParameterServiceMap>({
        name: "xpto"
      })
      expect("set" in jimple).toBe(true);
      expect("name" in jimple).toBe(true);
      expect("age" in jimple).toBe(false);
    })
    it("should be able to list keys", function () {
        interface ParameterServiceMap {
            name: string;
            age: number;
        }
        const jimple = Jimple.create<ParameterServiceMap>({
            name: "xpto",
            age: 19
        })
        expect(Object.keys(jimple)).toContain("name");
        expect(Object.keys(jimple)).toContain("age");
    })
    it("should return property descriptor for properties", function () {
      interface ParameterServiceMap {
        name: string;
      }
      const jimple = Jimple.create<ParameterServiceMap>({
        name: "xpto",
      });
      const setDescriptor = Object.getOwnPropertyDescriptor(jimple, "set");
      expect(setDescriptor).to.be.undefined;
      const nameDescriptor = Object.getOwnPropertyDescriptor(jimple, "name");
      expect(nameDescriptor).toBeDefined();
      expect(nameDescriptor?.get).toBeDefined();
      expect(nameDescriptor?.get!()).toBe("xpto");
      nameDescriptor?.set!("name");
      expect(nameDescriptor?.get!()).toBe("name");
      expect(nameDescriptor?.enumerable).toBe(true);
      expect(nameDescriptor?.configurable).toBe(true);
      const nonExistentDescriptor = Object.getOwnPropertyDescriptor(jimple, "non_existent_key");
      expect(nonExistentDescriptor).to.be.undefined;
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
      expect(jimple.symbol).to.not.equal(jimple.symbol);
      expect(jimple.cachedSymbol).to.equal(jimple.cachedSymbol);
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
