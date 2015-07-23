var assert = require("assert");
var parser = require("../");

describe('Test commands', function() {
    it('test one command', function () {
        var p;
        p = parser();
        var c = p
                .command("test")
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
        assert.deepEqual(c.parseArgv(["12", "s"]), {
            "a": 12,
            "b": "string"
        });

        assert.deepEqual(p.parseArgv(["test", "12", "s"]), {
            "a": 12,
            "b": "string"
        });

        assert.deepEqual(p.parseArgv(["test", "12", "s"], "command"), {
            "command": "test",
            "a": 12,
            "b": "string"
        });
    });

    it('test multiple command', function () {
        var p;
        p = parser();
        var c1 = p
                .command("test")
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
        var c2 = p
                .command("test2")
                .argument("a", "test function type")
                .argument("b", "test function type");

        assert.deepEqual(c1.parseArgv(["12", "s"]), {
            "a": 12,
            "b": "string"
        });

        assert.deepEqual(p.parseArgv(["test", "12", "s"]), {
            "a": 12,
            "b": "string"
        });

        assert.deepEqual(p.parseArgv(["test2", "12", "s"]), {
            "a": "12",
            "b": "s"
        });

        assert.deepEqual(p.parseArgv(["test", "12", "s"], "command"), {
            "command": "test",
            "a": 12,
            "b": "string"
        });
    });
});