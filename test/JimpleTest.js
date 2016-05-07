var expect = require("expect.js");
var Jimple = require("..");

describe("Jimple", function() {
    describe("#constructor()", function() {
        it("should support passing no parameters", function() {
            var jimple = new Jimple();
            expect(jimple).to.be.a(Jimple);
            expect(jimple.keys()).to.be.empty();
        });
        it("should support passing some parameters", function() {
            var jimple = new Jimple({
                "name": "xpto",
                "age": 19
            });
            expect(jimple.keys()).to.contain("name");
            expect(jimple.keys()).to.contain("age");
            expect(jimple.get("name")).to.be("xpto");
            expect(jimple.get("age")).to.be(19);
        });
        it("should support passing some services", function() {
            var jimple = new Jimple({
                "n2": function(app) {
                    return app.get("n") + 1
                },
                "n": function() {
                    return 19
                }
            });
            expect(jimple.keys()).to.contain("n");
            expect(jimple.keys()).to.contain("n2");
            expect(jimple.get("n2")).to.be(20);
            expect(jimple.get("n")).to.be(19);
            expect(jimple.raw("n")).to.be.a("function");
        });
        it("should support passing some services and parameters", function() {
            var jimple = new Jimple({
                "n2": function(app) {
                    return app.get("n") + 1
                },
                "n": 19
            });
            expect(jimple.keys()).to.contain("n");
            expect(jimple.keys()).to.contain("n2");
            expect(jimple.get("n2")).to.be(20);
            expect(jimple.get("n")).to.be(19);
            expect(jimple.raw("n")).to.be(19);
        });
    });
    describe("#get()", function() {
        it("should throw an exception when getting non existent key", function() {
            var jimple = new Jimple();
            expect(function() {
                jimple.get("non-existent-key");
            }).to.throwException();
        });
        it("should support getting parameters", function() {
            var jimple = new Jimple({
                "age": 19,
                "name": "xpto"
            });
            expect(jimple.get("age")).to.be(19);
            expect(jimple.get("name")).to.be("xpto");
        });
        it("should support getting services", function() {
            var jimple = new Jimple({
                "age": function() {
                    return 19
                }
            });
            expect(jimple.get("age")).to.be(19);
        });
        it("should cache values of the services", function() {
            var jimple = new Jimple({
                "symbol": Symbol
            });
            expect(jimple.get("symbol")).to.be(jimple.get("symbol"));
        });
        it("should not cache values of factories", function() {
            var jimple = new Jimple();
            jimple.set("symbol", jimple.factory(Symbol));
            expect(jimple.get("symbol")).not.to.be(jimple.get("symbol"));
        });
        it("should return raw values of protected closures", function() {
            var jimple = new Jimple();
            jimple.set("symbol", jimple.protect(Symbol));
            expect(jimple.get("symbol")).to.be(Symbol);
        });
    });
    describe("#set()", function() {
        it("should support saving parameters", function() {
            var jimple = new Jimple();
            jimple.set("age", 19);
            jimple.set("name", "xpto");
            expect(jimple.keys()).to.contain("age");
            expect(jimple.keys()).to.contain("name");
            expect(jimple.get("age")).to.be(19);
            expect(jimple.get("name")).to.be("xpto");
        });
        it("should support saving services", function() {
            var jimple = new Jimple();
            jimple.set("age", function() {
                return 19;
            });
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.keys()).to.contain("age");
            expect(jimple.keys()).to.contain("name");
            expect(jimple.has("age")).to.be.ok();
            expect(jimple.has("name")).to.be.ok();
            expect(jimple.get("age")).to.be(19);
            expect(jimple.get("name")).to.be("xpto");
        });
    });
    describe("#raw()", function() {
        it("should throw an exception when getting non existent key", function() {
            var jimple = new Jimple();
            expect(function() {
                jimple.raw("non-existent-key");
            }).to.throwException();
        });
        it("should return raw parameters", function() {
            var jimple = new Jimple();
            jimple.set("age", 19);
            jimple.set("name", "xpto");
            expect(jimple.keys()).to.contain("age");
            expect(jimple.keys()).to.contain("name");
            expect(jimple.raw("age")).to.be(19);
            expect(jimple.raw("name")).to.be("xpto");
        });
        it("should return raw services", function() {
            var jimple = new Jimple();
            jimple.set("symbol", Symbol);
            jimple.set("age", function() {
                return 19
            });
            expect(jimple.keys()).to.contain("symbol");
            expect(jimple.keys()).to.contain("age");
            expect(jimple.get("age")).to.be(19);
            expect(jimple.raw("age")).to.be.a("function");
            expect(jimple.raw("age")()).to.be(19);
            expect(jimple.get("symbol")).to.be(jimple.get("symbol"));
            expect(jimple.raw("symbol")).to.be(Symbol);
        });
    });
    describe("#factory()", function() {
        it("should throw exception if parameter is passed in", function() {
            var jimple = new Jimple();
            expect(jimple.factory.bind(jimple)).withArgs(19).to.throwError();
            expect(jimple.factory.bind(jimple)).withArgs("xpto").to.throwError();
        });
        it("should not throw exceptions if function is passed in", function() {
            var jimple = new Jimple();
            expect(jimple.factory.bind(jimple)).withArgs(Symbol).to.not.throwError();
            expect(jimple.factory.bind(jimple)).withArgs(function() {
                return "xpto"
            }).to.not.throwError();
        });
        it("should return unmodified function", function() {
            var jimple = new Jimple();
            var fn = function() {
                return "xpto"
            };
            expect(jimple.factory(Symbol)).to.be(Symbol);
            expect(jimple.factory(fn)).to.be(fn);
        });
    });
    describe("#protect()", function() {
        it("should throw exception if parameter is passed in", function() {
            var jimple = new Jimple();
            expect(jimple.protect.bind(jimple)).withArgs(19).to.throwError();
            expect(jimple.protect.bind(jimple)).withArgs("xpto").to.throwError();
        });
        it("should not throw exceptions if function is passed in", function() {
            var jimple = new Jimple();
            expect(jimple.protect.bind(jimple)).withArgs(Symbol).to.not.throwError();
            expect(jimple.protect.bind(jimple)).withArgs(function() {
                return "xpto"
            }).to.not.throwError();
        });
        it("should return unmodified function", function() {
            var jimple = new Jimple();
            var fn = function() {
                return "xpto"
            };
            expect(jimple.protect(Symbol)).to.be(Symbol);
            expect(jimple.protect(fn)).to.be(fn);
        });
    });
    describe("#keys()", function() {
        it("should return keys of parameters", function() {
            var jimple = new Jimple();
            expect(jimple.keys()).to.be.empty();
            jimple.set("age", 19);
            expect(jimple.keys()).to.contain("age");
            expect(jimple.keys()).to.have.length(1);
            jimple.set("name", "xpto");
            expect(jimple.keys()).to.have.length(2);
            expect(jimple.keys()).to.contain("age");
            expect(jimple.keys()).to.contain("name");
        });
        it("should return keys of services", function() {
            var jimple = new Jimple();
            expect(jimple.keys()).to.be.empty();
            jimple.set("age", function() {
                return 19;
            });
            expect(jimple.keys()).to.contain("age");
            expect(jimple.keys()).to.have.length(1);
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.keys()).to.have.length(2);
            expect(jimple.keys()).to.contain("age");
            expect(jimple.keys()).to.contain("name");
        });
        it("should return keys of services and parameters", function() {
            var jimple = new Jimple();
            expect(jimple.keys()).to.be.empty();
            jimple.set("age", 19);
            expect(jimple.keys()).to.contain("age");
            expect(jimple.keys()).to.have.length(1);
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.keys()).to.have.length(2);
            expect(jimple.keys()).to.contain("age");
            expect(jimple.keys()).to.contain("name");
        });
    });
    describe("#has()", function() {
        it("should recognize parameters", function() {
            var jimple = new Jimple();
            expect(jimple.has("age")).not.to.be.ok();
            expect(jimple.has("name")).not.to.be.ok();
            jimple.set("age", 19);
            expect(jimple.has("age")).to.be.ok();
            expect(jimple.has("name")).not.to.be.ok();
            jimple.set("name", "xpto");
            expect(jimple.has("age")).to.be.ok();
            expect(jimple.has("name")).to.be.ok();
        });
        it("should recognize services", function() {
            var jimple = new Jimple();
            expect(jimple.has("age")).not.to.be.ok();
            expect(jimple.has("name")).not.to.be.ok();
            jimple.set("age", function() {
                return 19;
            });
            expect(jimple.has("age")).to.be.ok();
            expect(jimple.has("name")).not.to.be.ok();
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.has("age")).to.be.ok();
            expect(jimple.has("name")).to.be.ok();
        });
        it("should return keys of services and parameters", function() {
            var jimple = new Jimple();
            expect(jimple.has("age")).not.to.be.ok();
            expect(jimple.has("name")).not.to.be.ok();
            jimple.set("age", 19);
            expect(jimple.has("age")).to.be.ok();
            expect(jimple.has("name")).not.to.be.ok();
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.has("age")).to.be.ok();
            expect(jimple.has("name")).to.be.ok();
        });
    });
    describe("#register()", function() {
        it("should call register() method on object", function() {
            var jimple = new Jimple();
            var called = false;
            var provider = {
                "register": function(app) {
                    expect(app).to.be(jimple);
                    called = true;
                }
            };
            jimple.register(provider);
            expect(called).to.be.ok();
        });
    });
    describe("#extend()", function() {
        it("should throw an error on non-existent key", function() {
            var jimple = new Jimple();
            expect(function() {
                jimple.extend("not-found-key", function() {});
            }).to.throwException();
        });
        it("should throw an error on parameter key", function() {
            var jimple = new Jimple();
            jimple.set("age", 19);
            expect(function() {
                jimple.extend("age", function() {});
            }).to.throwException();
        });
        it("should throw an error on protected key", function() {
            var jimple = new Jimple();
            jimple.set("theAnswer", jimple.protect(function() {
                return 42;
            }));
            expect(function() {
                jimple.extend("theAnswer", function() {
                    return 41;
                });
            }).to.throwException();
        });
        it("should throw an error on invalid callable", function() {
            var jimple = new Jimple();
            jimple.set("age", function() {
                return 19;
            });
            expect(function() {
                jimple.extend("age", 1);
            }).to.throwException();
        });
        it("should overwrite service correctly", function() {
            var jimple = new Jimple();
            jimple.set("age", function() {
                return 19;
            });
            jimple.set("one", 1);
            expect(jimple.get("age")).to.be(19);
            jimple.extend("age", function(result, app) {
                return result + app.get("one");
            });
            expect(jimple.get("age")).to.be(20);
        });
        it("should update factories correctly", function() {
            var jimple = new Jimple();
            var counter = 0;
            jimple.set("age", jimple.factory(function() {
                return 19 + (counter++);
            }));
            jimple.set("one", 1);
            expect(jimple.get("age")).to.be(19);
            expect(jimple.get("age")).to.be(20);
            jimple.extend("age", function(result, app) {
                return result + app.get("one");
            });
            expect(jimple.get("age")).to.be(22);
        });
    });

});
