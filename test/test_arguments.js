var assert = require("assert");
var parser = require("../");

describe('Test arguments', function() {

    describe('Test types', function() {

        it('test function type', function () {
            var p;
            p = parser()
                .argument("a", "test function type", {
                    "type": "int",
                })
                .argument("b", "test function type", {
                    "type": function(value, error){
                        value = parseInt(value);
                        if(isNaN(value)){
                            value = "string";
                        }
                        return value;
                    }
                });
            assert.deepEqual(p.parseArgv(["12", "s"]), {
                "a": 12,
                "b": "string"
            });

            assert.deepEqual(p.parseArgv(["12b", "12"]), {
                "a": 12,
                "b": 12
            });
        });

    });

    describe('Test nargs', function() {

        it('test narg symbol', function () {
            var p;
            p = parser()
                .argument("a", "test function type", {
                    "type": "int",
                    "narg": "?"
                })
                .argument("b", "test function type", {
                    "narg": "+"
                });
            assert.deepEqual(p.parseArgv(["12", "a", "b"]), {
                "a": 12,
                "b": ["a", "b"]
            });

            p = parser()
                .argument("a", "test function type", {
                    "narg": "*"
                });
            assert.deepEqual(p.parseArgv(["12", "a", "b"]), {
                "a": ["12", "a", "b"]
            });
        });

        it('test narg number', function () {
            var p;
            p = parser()
                .argument("a", "test function type", {
                    "type": "int",
                    "narg": 1
                })
                .argument("b", "test function type", {
                    "narg": 2
                });
            assert.deepEqual(p.parseArgv(["12", "a", "b"]), {
                "a": 12,
                "b": ["a", "b"]
            });

            p = parser()
                .argument("a", "test function type", {
                    "narg": 5
                });
            assert.deepEqual(p.parseArgv(["12", "a", "b"]), {
                "a": ["12", "a", "b", undefined, undefined]
            });
        });
    });

});