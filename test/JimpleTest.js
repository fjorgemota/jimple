"use strict";
const { expect } = require("chai");
const Jimple = require("..");

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
            expect(jimple.keys()).to.include("name");
            expect(jimple.keys()).to.include("age");
            expect(jimple.get("name")).to.equal("xpto");
            expect(jimple.get("age")).to.equal(19);
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
            expect(jimple.keys()).to.include("n");
            expect(jimple.keys()).to.include("n2");
            expect(jimple.get("n2")).to.equal(20);
            expect(jimple.get("n")).to.equal(19);
            expect(jimple.raw("n")).to.be.a("function");
        });
        it("should support passing some services and parameters", function() {
            let jimple = new Jimple({
                "n2": function(app) {
                    return app.get("n") + 1
                },
                "n": 19
            });
            expect(jimple.keys()).to.include("n");
            expect(jimple.keys()).to.include("n2");
            expect(jimple.get("n2")).to.equal(20);
            expect(jimple.get("n")).to.equal(19);
            expect(jimple.raw("n")).to.equal(19);
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
            expect(jimple.get("age")).to.equal(19);
            expect(jimple.get("name")).to.equal("xpto");
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
            expect(jimple.get("age")).to.equal(19);
        });
        it("should cache values of the services", function() {
            let jimple = new Jimple({
                "symbol": Symbol
            });
            expect(jimple.get("symbol")).to.equal(jimple.get("symbol"));
        });
        it("should not cache values of factories", function() {
            let jimple = new Jimple();
            jimple.set("symbol", jimple.factory(Symbol));
            expect(jimple.get("symbol")).to.not.equal(jimple.get("symbol"));
        });
        it("should return raw values of protected closures", function() {
            let jimple = new Jimple();
            jimple.set("symbol", jimple.protect(Symbol));
            expect(jimple.get("symbol")).to.equal(Symbol);
        });
    });
    describe("#set()", function() {
        it("should support saving parameters", function() {
            let jimple = new Jimple();
            jimple.set("age", 19);
            jimple.set("name", "xpto");
            expect(jimple.keys()).to.include("age");
            expect(jimple.keys()).to.include("name");
            expect(jimple.get("age")).to.equal(19);
            expect(jimple.get("name")).to.equal("xpto");
        });
        it("should support saving services", function() {
            let jimple = new Jimple();
            jimple.set("age", function() {
                return 19;
            });
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.keys()).to.include("age");
            expect(jimple.keys()).to.include("name");
            expect(jimple.has("age")).to.be.ok;
            expect(jimple.has("name")).to.be.ok;
            expect(jimple.get("age")).to.equal(19);
            expect(jimple.get("name")).to.equal("xpto");
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
            expect(jimple.keys()).to.include("age");
            expect(jimple.keys()).to.include("name");
            expect(jimple.raw("age")).to.equal(19);
            expect(jimple.raw("name")).to.equal("xpto");
        });
        it("should return raw services", function() {
            let jimple = new Jimple();
            jimple.set("symbol", Symbol);
            jimple.set("age", function() {
                return 19
            });
            expect(jimple.keys()).to.include("symbol");
            expect(jimple.keys()).to.include("age");
            expect(jimple.get("age")).to.equal(19);
            expect(jimple.raw("age")).to.be.a("function");
            expect(jimple.raw("age")()).to.equal(19);
            expect(jimple.get("symbol")).to.equal(jimple.get("symbol"));
            expect(jimple.raw("symbol")).to.equal(Symbol);
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
            expect(jimple.factory(Symbol)).to.equal(Symbol);
            expect(jimple.factory(fn)).to.equal(fn);
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
            expect(jimple.protect(Symbol)).to.equal(Symbol);
            expect(jimple.protect(fn)).to.equal(fn);
        });
    });
    describe("#keys()", function() {
        it("should return keys of parameters", function() {
            let jimple = new Jimple();
            expect(jimple.keys()).to.be.empty;
            jimple.set("age", 19);
            expect(jimple.keys()).to.include("age");
            expect(jimple.keys()).to.have.length(1);
            jimple.set("name", "xpto");
            expect(jimple.keys()).to.have.length(2);
            expect(jimple.keys()).to.include("age");
            expect(jimple.keys()).to.include("name");
        });
        it("should return keys of services", function() {
            let jimple = new Jimple();
            expect(jimple.keys()).to.be.empty;
            jimple.set("age", function() {
                return 19;
            });
            expect(jimple.keys()).to.include("age");
            expect(jimple.keys()).to.have.length(1);
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.keys()).to.have.length(2);
            expect(jimple.keys()).to.include("age");
            expect(jimple.keys()).to.include("name");
        });
        it("should return keys of services and parameters", function() {
            let jimple = new Jimple();
            expect(jimple.keys()).to.be.empty;
            jimple.set("age", 19);
            expect(jimple.keys()).to.include("age");
            expect(jimple.keys()).to.have.length(1);
            jimple.set("name", function() {
                return "xpto";
            });
            expect(jimple.keys()).to.have.length(2);
            expect(jimple.keys()).to.include("age");
            expect(jimple.keys()).to.include("name");
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
                    expect(app).to.equal(jimple);
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
            expect(jimple.get("age")).to.equal(19);
            jimple.extend("age", function(result, app) {
                return result + app.get("one");
            });
            expect(jimple.get("age")).to.equal(20);
        });
        it("should update factories correctly", function() {
            let jimple = new Jimple();
            var counter = 0;
            jimple.set("age", jimple.factory(function() {
                return 19 + (counter++);
            }));
            jimple.set("one", 1);
            expect(jimple.get("age")).to.equal(19);
            expect(jimple.get("age")).to.equal(20);
            jimple.extend("age", function(result, app) {
                return result + app.get("one");
            });
            expect(jimple.get("age")).to.equal(22);
        });
    });
    describe("#proxy()", function() {
        before(function() {
            if (typeof Proxy === "undefined") {
                // Skips tests of this method if Proxy is not supported..
                this.skip();
            }
        });
        it("should thrown a error on non-existent key", function() {
            let jimple = Jimple.proxy();
            expect(function() {
                jimple["not-found-key"]
            }).to.throw();
        });

        it("should support getting parameters", function() {
            let jimple = Jimple.proxy();
            jimple["age"] = 19;
            expect(jimple["age"]).to.equal(19);
        });
        it("should support getting services", function() {
            let jimple = Jimple.proxy();
            jimple["age"] =  function() {
                return 19
            };
            expect(jimple["age"]).to.equal(19);
        });
        it("should support 'in' operator", function() {
            let jimple = Jimple.proxy();
            jimple["age"] =  function() {
                return 19
            };
            jimple["name"] = "xpto";
            expect("age" in jimple).to.equal(true);
            expect("name" in jimple).to.equal(true);
        });
        it("should support Object.getOwnPropertyNames", function() {
            let jimple = Jimple.proxy({
                "country": "Brazil"
            });
            jimple["age"] = function() {
                return 19
            };
            jimple["name"] = "xpto";
            expect(jimple["age"]).to.equal(19);
            expect(jimple["name"]).to.equal("xpto");
            expect(jimple["country"]).to.equal("Brazil");
            let keys = Object.getOwnPropertyNames(jimple);
            expect(keys).to.have.length(3);
            expect(keys).to.include("age");
            expect(keys).to.include("name");
            expect(keys).to.include("country");
        });
        it("should support Object.getOwnPropertyDescriptor", function() {
            let jimple = Jimple.proxy({
                "country": "Brazil"
            });
            jimple.set("age", 19);
            jimple["name"] = "xpto";
            expect(jimple["age"]).to.equal(19);
            expect(jimple["name"]).to.equal("xpto");
            let age = Object.getOwnPropertyDescriptor(jimple, "age");
            expect(age.writable).to.equal(true);
            expect(age.value).to.equal(19);
            let name = Object.getOwnPropertyDescriptor(jimple, "name");
            expect(name.writable).to.equal(true);
            expect(name.value).to.equal("xpto");
            let country = Object.getOwnPropertyDescriptor(jimple, "country");
            expect(country.writable).to.equal(true);
            expect(country.value).to.equal("Brazil");
            let non_existent_key = Object.getOwnPropertyDescriptor(jimple, "non-existent-key");
            expect(non_existent_key).to.equal(undefined);
            expect(function() {
                let get = Object.getOwnPropertyDescriptor(jimple, "get");
                expect(get.writable).to.equal(false);
            }).to.throw();
        });
        it("should not overwrite methods names via set", function() {
            let jimple = Jimple.proxy();
            expect(jimple.get).to.be.a('function');
            expect(function() {
                jimple["get"] = 20
            }).to.throw();
        })
        it("should not overwrite methods names via initial parameters", function() {
            expect(function() {
                let jimple = Jimple.proxy({
                    "get": 42
                });
            }).to.throw();
        })
    })
});
