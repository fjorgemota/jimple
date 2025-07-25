"use strict";
import { describe, it, expect } from "vitest";
import  Jimple from "./Jimple.js";

describe("Jimple", function() {
    describe("#constructor()", function() {
        it("should support passing no parameters", function() {
            let jimple = new Jimple();
            expect(jimple).to.be.an.instanceof(Jimple);
            expect(jimple.keys()).to.be.empty;
        });
        it("should support passing some parameters", function() {
            let jimple = new Jimple({
                "name": "xpto",
                "age": 19
            });
            expect(jimple.keys()).toContain("name");
            expect(jimple.keys()).toContain("age");
            expect(jimple.get("name")).toBe("xpto");
            expect(jimple.get("age")).toBe(19);
        });
        it("should support passing some services", function() {
            let jimple = new Jimple({
                "n2": function(app) {
                    return app.get("n") + 1
                },
                "n": function() {
                    return 19
                }
            });
            expect(jimple.keys()).toContain("n");
            expect(jimple.keys()).toContain("n2");
            expect(jimple.get("n2")).toBe(20);
            expect(jimple.get("n")).toBe(19);
            expect(jimple.raw("n")).to.be.a("function");
        });
        it("should support passing some services and parameters", function() {
            let jimple = new Jimple({
                "n2": function(app) {
                    return app.get("n") + 1
                },
                "n": 19
            });
            expect(jimple.keys()).toContain("n");
            expect(jimple.keys()).toContain("n2");
            expect(jimple.get("n2")).toBe(20);
            expect(jimple.get("n")).toBe(19);
            expect(jimple.raw("n")).toBe(19);
        });
    });
    describe("#get()", function() {
        it("should throw an exception when getting non existent key", function() {
            let jimple = new Jimple();
            expect(function() {
                jimple.get("non-existent-key");
            }).to.throw();
        });
        it("should support getting parameters", function() {
            let jimple = new Jimple({
                "age": 19,
                "name": "xpto"
            });
            expect(jimple.get("age")).toBe(19);
            expect(jimple.get("name")).toBe("xpto");
        });
        it("should treat generator function as parameters", function() {
            let jimple = new Jimple({
                "age": function*() {
                    yield 19
                }
            });
            expect(jimple.get("age")).to.not.equal(19);
            let it = jimple.get("age")();
            expect(it.next()).to.eql({
                "value": 19,
                "done": false
            });
            expect(it.next()).to.eql({
                "value": undefined,
                "done": true
            });
        });
        it("should support getting services", function() {
            let jimple = new Jimple({
                "age": function() {
                    return 19
                }
            });
            expect(jimple.get("age")).toBe(19);
        });
        it("should cache values of the services", function() {
            let jimple = new Jimple({
                "symbol": Symbol
            });
            expect(jimple.get("symbol")).toBe(jimple.get("symbol"));
        });
        it("should not cache values of factories", function() {
            let jimple = new Jimple();
            jimple.set("symbol", jimple.factory(Symbol));
            expect(jimple.get("symbol")).to.not.equal(jimple.get("symbol"));
        });
        it("should return raw values of protected closures", function() {
            let jimple = new Jimple();
            jimple.set("symbol", jimple.protect(Symbol));
            expect(jimple.get("symbol")).toBe(Symbol);
        });
    });
    describe("#set()", function() {
        it("should support saving parameters", function() {
            let jimple = new Jimple();
            jimple.set("age", 19);
            jimple.set("name", "xpto");
            expect(jimple.keys()).toContain("age");
            expect(jimple.keys()).toContain("name");
            expect(jimple.get("age")).toBe(19);
            expect(jimple.get("name")).toBe("xpto");
        });
        it("should support saving services", function() {
            let jimple = new Jimple();
            jimple.set("age", function() {
                return 19;
            });
            jimple.set("name", function() {
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
    describe("#raw()", function() {
        it("should throw an exception when getting non existent key", function() {
            let jimple = new Jimple();
            expect(function() {
                jimple.raw("non-existent-key");
            }).to.throw();
        });
        it("should return raw parameters", function() {
            let jimple = new Jimple();
            jimple.set("age", 19);
            jimple.set("name", "xpto");
            expect(jimple.keys()).toContain("age");
            expect(jimple.keys()).toContain("name");
            expect(jimple.raw("age")).toBe(19);
            expect(jimple.raw("name")).toBe("xpto");
        });
        it("should return raw services", function() {
            let jimple = new Jimple();
            jimple.set("symbol", Symbol);
            jimple.set("age", function() {
                return 19
            });
            expect(jimple.keys()).toContain("symbol");
            expect(jimple.keys()).toContain("age");
            expect(jimple.get("age")).toBe(19);
            expect(jimple.raw("age")).to.be.a("function");
            expect(jimple.raw("age")()).toBe(19);
            expect(jimple.get("symbol")).toBe(jimple.get("symbol"));
            expect(jimple.raw("symbol")).toBe(Symbol);
        });
    });
    describe("#factory()", function() {
        it("should throw exception if parameter is passed in", function() {
            let jimple = new Jimple();
            expect(function() {
                jimple.factory(19)
            }).to.throw();
            expect(function() {
                jimple.factory("xpto")
            }).to.throw();
        });
        it("should not throw exceptions if function is passed in", function() {
            let jimple = new Jimple();
            expect(function() {
                jimple.factory(Symbol)
            }).to.not.throw();
            expect(function() {
                jimple.factory(function(){
                    return "xpto"
                });
            }).to.not.throw();
        });
        it("should return unmodified function", function() {
            let jimple = new Jimple();
            var fn = function() {
                return "xpto"
            };
            expect(jimple.factory(Symbol)).toBe(Symbol);
            expect(jimple.factory(fn)).toBe(fn);
        });
    });
    describe("#protect()", function() {
        it("should throw exception if parameter is passed in", function() {
            let jimple = new Jimple();
            expect(function() {
                jimple.protect(19)
            }).to.throw();
            expect(function() {
                jimple.protect("xpto")
            }).to.throw();
        });
        it("should not throw exceptions if function is passed in", function() {
            let jimple = new Jimple();
            expect(function() {
                jimple.protect(Symbol)
            }).to.not.throw();
            expect(function() {
                jimple.protect(function(){
                    return "xpto"
                });
            }).to.not.throw();
        });
        it("should return unmodified function", function() {
            let jimple = new Jimple();
            var fn = function() {
                return "xpto"
            };
            expect(jimple.protect(Symbol)).toBe(Symbol);
            expect(jimple.protect(fn)).toBe(fn);
        });
    });
    describe("#keys()", function() {
        it("should return keys of parameters", function() {
            let jimple = new Jimple();
            expect(jimple.keys()).to.be.empty;
            jimple.set("age", 19);
            expect(jimple.keys()).toContain("age");
            expect(jimple.keys()).to.have.length(1);
            jimple.set("name", "xpto");
            expect(jimple.keys()).to.have.length(2);
            expect(jimple.keys()).toContain("age");
            expect(jimple.keys()).toContain("name");
        });
        it("should return keys of services", function() {
            let jimple = new Jimple();
            expect(jimple.keys()).to.be.empty;
            jimple.set("age", function() {
                return 19;
            });
            expect(jimple.keys()).toContain("age");
            expect(jimple.keys()).to.have.length(1);
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.keys()).to.have.length(2);
            expect(jimple.keys()).toContain("age");
            expect(jimple.keys()).toContain("name");
        });
        it("should return keys of services and parameters", function() {
            let jimple = new Jimple();
            expect(jimple.keys()).to.be.empty;
            jimple.set("age", 19);
            expect(jimple.keys()).toContain("age");
            expect(jimple.keys()).to.have.length(1);
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.keys()).to.have.length(2);
            expect(jimple.keys()).toContain("age");
            expect(jimple.keys()).toContain("name");
        });
    });
    describe("#has()", function() {
        it("should recognize parameters", function() {
            let jimple = new Jimple();
            expect(jimple.has("age")).to.not.be.ok;
            expect(jimple.has("name")).to.not.be.ok;
            jimple.set("age", 19);
            expect(jimple.has("age")).to.be.ok;
            expect(jimple.has("name")).to.not.be.ok;
            jimple.set("name", "xpto");
            expect(jimple.has("age")).to.be.ok;
            expect(jimple.has("name")).to.be.ok;
        });
        it("should recognize services", function() {
            let jimple = new Jimple();
            expect(jimple.has("age")).to.not.be.ok;
            expect(jimple.has("name")).to.not.be.ok;
            jimple.set("age", function() {
                return 19;
            });
            expect(jimple.has("age")).to.be.ok;
            expect(jimple.has("name")).to.not.be.ok;
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.has("age")).to.be.ok;
            expect(jimple.has("name")).to.be.ok;
        });
        it("should return keys of services and parameters", function() {
            let jimple = new Jimple();
            expect(jimple.has("age")).to.not.be.ok;
            expect(jimple.has("name")).to.not.be.ok;
            jimple.set("age", 19);
            expect(jimple.has("age")).to.be.ok;
            expect(jimple.has("name")).to.not.be.ok;
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.has("age")).to.be.ok;
            expect(jimple.has("name")).to.be.ok;
        });
    });
    describe("#register()", function() {
        it("should call register() method on object", function() {
            let jimple = new Jimple();
            var called = false;
            var provider = {
                "register": function(app) {
                    expect(app).toBe(jimple);
                    called = true;
                }
            };
            jimple.register(provider);
            expect(called).to.be.ok;
        });
    });
    describe("#extend()", function() {
        it("should throw an error on non-existent key", function() {
            let jimple = new Jimple();
            expect(function() {
                jimple.extend("not-found-key", function() {});
            }).to.throw();
        });
        it("should throw an error on parameter key", function() {
            let jimple = new Jimple();
            jimple.set("age", 19);
            expect(function() {
                jimple.extend("age", function() {});
            }).to.throw();
        });
        it("should throw an error on protected key", function() {
            let jimple = new Jimple();
            jimple.set("theAnswer", jimple.protect(function() {
                return 42;
            }));
            expect(function() {
                jimple.extend("theAnswer", function() {
                    return 41;
                });
            }).to.throw();
        });
        it("should throw an error on invalid callable", function() {
            let jimple = new Jimple();
            jimple.set("age", function() {
                return 19;
            });
            expect(function() {
                jimple.extend("age", 1);
            }).to.throw();
        });
        it("should overwrite service correctly", function() {
            let jimple = new Jimple();
            jimple.set("age", function() {
                return 19;
            });
            jimple.set("one", 1);
            expect(jimple.get("age")).toBe(19);
            jimple.extend("age", function(result, app) {
                return result + app.get("one");
            });
            expect(jimple.get("age")).toBe(20);
        });
        it("should update factories correctly", function() {
            let jimple = new Jimple();
            var counter = 0;
            jimple.set("age", jimple.factory(function() {
                return 19 + (counter++);
            }));
            jimple.set("one", 1);
            expect(jimple.get("age")).toBe(19);
            expect(jimple.get("age")).toBe(20);
            jimple.extend("age", function(result, app) {
                return result + app.get("one");
            });
            expect(jimple.get("age")).toBe(22);
        });
    });
    describe('#provider', function() {
      it("should register a provider created by the shorthand static method", function() {
        let jimple = new Jimple();
        var called = false;
        var provider = Jimple.provider(function(app) {
            expect(app).toBe(jimple);
            called = true;
        });
        jimple.register(provider);
        expect(called).to.be.ok;
      });
    });
});
