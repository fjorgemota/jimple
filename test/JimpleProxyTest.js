"use strict";
const { expect } = require("chai");
const Jimple = require("../src/Jimple.js");
const MySymbol = require("./symbol");

describe("JimpleProxy", function () {
  describe("#constructor()", function () {
    it("should support passing no parameters", function () {
      const jimple = Jimple();
      expect(jimple.keys()).to.be.empty;
    });
    it("should support passing some parameters", function () {
      const jimple = Jimple({
        name: "xpto",
        age: 19,
      });
      expect(jimple.keys()).to.include("name");
      expect(jimple.keys()).to.include("age");
      expect(jimple.name).to.equal("xpto");
      expect(jimple.age).to.equal(19);
    });
    it("should support passing some services", function () {
      const jimple = Jimple({
        n2: function (app) {
          return app.n + 1;
        },
        n: function () {
          return 19;
        },
      });
      expect(jimple.keys()).to.include("n");
      expect(jimple.keys()).to.include("n2");
      expect(jimple.n2).to.equal(20);
      expect(jimple.n).to.equal(19);
      expect(jimple.raw("n")).to.be.a("function");
    });
    it("should support passing some services and parameters", function () {
      const jimple = Jimple({
        n2: function (app) {
          return app.n + 1;
        },
        n: 19,
      });
      expect(jimple.keys()).to.include("n");
      expect(jimple.keys()).to.include("n2");
      expect(jimple.n2).to.equal(20);
      expect(jimple.n).to.equal(19);
      expect(jimple.raw("n")).to.equal(19);
    });
  });
  describe("#get()", function () {
    it("should throw an exception when getting non existent key", function () {
      const jimple = Jimple();
      expect(function () {
        jimple.nonxistent;
      }).to.throw();
    });
    it("should support getting parameters", function () {
      const jimple = Jimple({
        age: 19,
        name: "xpto",
      });
      expect(jimple.age).to.equal(19);
      expect(jimple.name).to.equal("xpto");
    });
    it("should treat generator function as parameters", function () {
      const jimple = Jimple({
        age: function* () {
          yield 19;
        },
      });
      expect(jimple.age).to.not.equal(19);
      let it = jimple.age();
      expect(it.next()).to.eql({
        value: 19,
        done: false,
      });
      expect(it.next()).to.eql({
        value: undefined,
        done: true,
      });
    });
    it("should support getting services", function () {
      const jimple = Jimple({
        age: function () {
          return 19;
        },
      });
      expect(jimple.age).to.equal(19);
    });
    it("should cache values of the services", function () {
      const jimple = Jimple({
        symbol: MySymbol,
      });
      expect(jimple.symbol).to.equal(jimple.symbol);
    });
    it("should not cache values of factories", function () {
      const jimple = Jimple();
      jimple.symbol = jimple.factory(MySymbol);
      expect(jimple.symbol).to.not.equal(jimple.symbol);
    });
    it("should return raw values of protected closures", function () {
      const jimple = Jimple();
      jimple.symbol = jimple.protect(MySymbol);
      expect(jimple.symbol).to.equal(MySymbol);
    });
  });
  describe("#set()", function () {
    it("should support saving parameters", function () {
      const jimple = Jimple();
      jimple.age = 19;
      jimple.name = "xpto";
      expect(jimple.keys()).to.include("age");
      expect(jimple.keys()).to.include("name");
      expect(jimple.age).to.equal(19);
      expect(jimple.name).to.equal("xpto");
    });
    it("should support saving services", function () {
      const jimple = Jimple();
      jimple.age = function () {
        return 19;
      };
      jimple.name = function () {
        return "xpto";
      };
      expect(jimple.keys()).to.include("age");
      expect(jimple.keys()).to.include("name");
      expect("age" in jimple).to.be.ok;
      expect("name" in jimple).to.be.ok;
      expect(jimple.age).to.equal(19);
      expect(jimple.name).to.equal("xpto");
    });
  });
  describe("#raw()", function () {
    it("should throw an exception when getting non existent key", function () {
      const jimple = Jimple();
      expect(function () {
        jimple.raw("non-existent-key");
      }).to.throw();
    });
    it("should return raw parameters", function () {
      const jimple = Jimple();
      jimple.age = 19;
      jimple.name = "xpto";
      expect(jimple.keys()).to.include("age");
      expect(jimple.keys()).to.include("name");
      expect(jimple.raw("age")).to.equal(19);
      expect(jimple.raw("name")).to.equal("xpto");
    });
    it("should return raw services", function () {
      const jimple = Jimple();
      jimple.symbol = MySymbol;
      jimple.age = function () {
        return 19;
      };
      expect(jimple.keys()).to.include("symbol");
      expect(jimple.keys()).to.include("age");
      expect(jimple.age).to.equal(19);
      expect(jimple.raw("age")).to.be.a("function");
      expect(jimple.raw("age")()).to.equal(19);
      expect(jimple.symbol).to.equal(jimple.symbol);
      expect(jimple.raw("symbol")).to.equal(MySymbol);
    });
  });
  describe("#factory()", function () {
    it("should throw exception if parameter is passed in", function () {
      const jimple = Jimple();
      expect(function () {
        jimple.factory(19);
      }).to.throw();
      expect(function () {
        jimple.factory("xpto");
      }).to.throw();
    });
    it("should not throw exceptions if function is passed in", function () {
      const jimple = Jimple();
      expect(function () {
        jimple.factory(MySymbol);
      }).to.not.throw();
      expect(function () {
        jimple.factory(function () {
          return "xpto";
        });
      }).to.not.throw();
    });
    it("should return unmodified function", function () {
      const jimple = Jimple();
      var fn = function () {
        return "xpto";
      };
      expect(jimple.factory(MySymbol)).to.equal(MySymbol);
      expect(jimple.factory(fn)).to.equal(fn);
    });
  });
  describe("#protect()", function () {
    it("should throw exception if parameter is passed in", function () {
      const jimple = Jimple();
      expect(function () {
        jimple.protect(19);
      }).to.throw();
      expect(function () {
        jimple.protect("xpto");
      }).to.throw();
    });
    it("should not throw exceptions if function is passed in", function () {
      const jimple = Jimple();
      expect(function () {
        jimple.protect(MySymbol);
      }).to.not.throw();
      expect(function () {
        jimple.protect(function () {
          return "xpto";
        });
      }).to.not.throw();
    });
    it("should return unmodified function", function () {
      const jimple = Jimple();
      var fn = function () {
        return "xpto";
      };
      expect(jimple.protect(MySymbol)).to.equal(MySymbol);
      expect(jimple.protect(fn)).to.equal(fn);
    });
  });
  describe("#keys()", function () {
    it("should return keys of parameters", function () {
      const jimple = Jimple();
      expect(jimple.keys()).to.be.empty;
      jimple.age = 19;
      expect(jimple.keys()).to.include("age");
      expect(jimple.keys()).to.have.length(1);
      jimple.name = "xpto";
      expect(jimple.keys()).to.have.length(2);
      expect(jimple.keys()).to.include("age");
      expect(jimple.keys()).to.include("name");
    });
    it("should return keys of services", function () {
      const jimple = Jimple();
      expect(jimple.keys()).to.be.empty;
      jimple.age = function () {
        return 19;
      };
      expect(jimple.keys()).to.include("age");
      expect(jimple.keys()).to.have.length(1);
      jimple.name = function () {
        return "xpto";
      };
      expect(jimple.keys()).to.have.length(2);
      expect(jimple.keys()).to.include("age");
      expect(jimple.keys()).to.include("name");
    });
    it("should return keys of services and parameters", function () {
      const jimple = Jimple();
      expect(jimple.keys()).to.be.empty;
      jimple.age = 19;
      expect(jimple.keys()).to.include("age");
      expect(jimple.keys()).to.have.length(1);
      jimple.name = function () {
        return "xpto";
      };
      expect(jimple.keys()).to.have.length(2);
      expect(jimple.keys()).to.include("age");
      expect(jimple.keys()).to.include("name");
    });
  });
  describe("#has()", function () {
    it("should recognize parameters", function () {
      const jimple = Jimple();
      expect("age" in jimple).to.not.be.ok;
      expect("name" in jimple).to.not.be.ok;
      jimple.age = 19;
      expect("age" in jimple).to.be.ok;
      expect("name" in jimple).to.not.be.ok;
      jimple.name = "xpto";
      expect("age" in jimple).to.be.ok;
      expect("name" in jimple).to.be.ok;
    });
    it("should recognize services", function () {
      const jimple = Jimple();
      expect("age" in jimple).to.not.be.ok;
      expect("name" in jimple).to.not.be.ok;
      jimple.age = function () {
        return 19;
      };
      expect("age" in jimple).to.be.ok;
      expect("name" in jimple).to.not.be.ok;
      jimple.name = function () {
        return "xpto";
      };
      expect("age" in jimple).to.be.ok;
      expect("name" in jimple).to.be.ok;
    });
    it("should return keys of services and parameters", function () {
      const jimple = Jimple();
      expect("age" in jimple).to.not.be.ok;
      expect("name" in jimple).to.not.be.ok;
      jimple.age = 19;
      expect("age" in jimple).to.be.ok;
      expect("name" in jimple).to.not.be.ok;
      jimple.name = function () {
        return "xpto";
      };
      expect("age" in jimple).to.be.ok;
      expect("name" in jimple).to.be.ok;
    });
  });
  describe("#register()", function () {
    it("should call register() method on object", function () {
      const jimple = Jimple();
      var called = false;
      var provider = {
        register: function (app) {
          expect(app).to.equal(jimple);
          called = true;
        },
      };
      jimple.register(provider);
      expect(called).to.be.ok;
    });
  });
  describe("#extend()", function () {
    it("should throw an error on non-existent key", function () {
      const jimple = Jimple();
      expect(function () {
        jimple.extend("not-found-key", function () {});
      }).to.throw();
    });
    it("should throw an error on parameter key", function () {
      const jimple = Jimple();
      jimple.age = 19;
      expect(function () {
        jimple.extend("age", function () {});
      }).to.throw();
    });
    it("should throw an error on protected key", function () {
      const jimple = Jimple();
      jimple.theAnswer = jimple.protect(function () {
        return 42;
      });
      expect(function () {
        jimple.extend("theAnswer", function () {
          return 41;
        });
      }).to.throw();
    });
    it("should throw an error on invalid callable", function () {
      const jimple = Jimple();
      jimple.age = function () {
        return 19;
      };
      expect(function () {
        jimple.extend("age", 1);
      }).to.throw();
    });
    it("should overwrite service correctly", function () {
      const jimple = Jimple();
      jimple.age = function () {
        return 19;
      };
      jimple.one = 1;
      expect(jimple.age).to.equal(19);
      jimple.extend("age", function (result, app) {
        return result + app.one;
      });
      expect(jimple.age).to.equal(20);
    });
    it("should update factories correctly", function () {
      const jimple = Jimple();
      var counter = 0;
      jimple.age = jimple.factory(function () {
        return 19 + counter++;
      });
      jimple.one = 1;
      expect(jimple.age).to.equal(19);
      expect(jimple.age).to.equal(20);
      jimple.extend("age", function (result, app) {
        return result + app.one;
      });
      expect(jimple.age).to.equal(22);
    });
  });
  describe("#provider", function () {
    it("should register a provider created by the shorthand static method", function () {
      const jimple = Jimple();
      var called = false;
      var provider = Jimple.provider(function (app) {
        expect(app).to.equal(jimple);
        called = true;
      });
      jimple.register(provider);
      expect(called).to.be.ok;
    });
  });
});
