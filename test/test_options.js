var assert = require("assert");
var parser = require("../");

describe('Test options', function() {

    describe('Test actions', function() {

        it('test action store', function () {
            var p;
            p = parser()
                .option("-a", "test default store")
                .option("-b", "test assign store", {
                    "action": "store"
                });
            assert.deepEqual(p.parseArgv(["-a", "storeA", "-b", "storeB"]), {
                "A": "storeA",
                "B": "storeB"
            });

            assert.deepEqual(p.parseArgv(["-a", "-b", "storeB"]), {
                "B": "storeB"
            });
        });

        it('test action store_const', function () {
            var p;
            p = parser()
                .option("-a", "test store_const", {
                    "action": "store_const"
                });

            assert.deepEqual(p.parseArgv(["-a"]), {});

            p = parser()
                .option("-a", "test store_const", {
                    "action": "store_const",
                    "const": 1
                });

            assert.deepEqual(p.parseArgv(["-a"]), {
                "A": 1
            });

            p = parser()
                .option("-a", "test store_const", {
                    "action": "store_const",
                    "const": 1
                })
                .option("-b", "test store_const", {
                    "action": "store_const",
                    "const": 2
                });

            assert.deepEqual(p.parseArgv(["-a", "-b"]), {
                "A": 1,
                "B": 2
            });

            p = parser()
                .option("-a", "test store_const", {
                    "action": "store_const",
                    "dest": "mode",
                    "const": 1
                })
                .option("-b", "test store_const", {
                    "action": "store_const",
                    "dest": "mode",
                    "const": 2
                });

            assert.deepEqual(p.parseArgv(["-a"]), {
                "mode": 1
            });
            assert.deepEqual(p.parseArgv(["-b"]), {
                "mode": 2
            });
            assert.deepEqual(p.parseArgv(["-a", "-b"]), {
                "mode": 2
            });
        });

        it('test action store_true', function () {
            var p;
            p = parser()
                .option("-a", "test store_true", {
                    "action": "store_true"
                });
            assert.deepEqual(p.parseArgv(["-a"]), {
                "A": true
            });
        });

        it('test action store_false', function () {
            var p;
            p = parser()
                .option("-a", "test store_false", {
                    "action": "store_false"
                });
            assert.deepEqual(p.parseArgv(["-a"]), {
                "A": false
            });
        });

        it('test action append', function () {
            var p;
            p = parser()
                .option("-a", "test append", {
                    "action": "append"
                });

            assert.deepEqual(p.parseArgv(["-a", "1"]), {
                "A": ["1"]
            });
            assert.deepEqual(p.parseArgv(["-a", "1", "-a", "2"]), {
                "A": ["1", "2"]
            });
        });

        it('test action append_const', function () {
            var p;
            p = parser()
                .option("-a", "test append_const", {
                    "action": "append_const"
                });

            assert.deepEqual(p.parseArgv(["-a", "1"]), {});

            p = parser()
                .option("-a", "test append_const", {
                    "action": "append_const",
                    "dest": "mode",
                    "const": "a"
                })
                .option("-b", "test append_const", {
                    "action": "append_const",
                    "dest": "mode",
                    "const": "b"
                });

            assert.deepEqual(p.parseArgv(["-a"]), {
                "mode": ["a"]
            });

            assert.deepEqual(p.parseArgv(["-a", "-b"]), {
                "mode": ["a", "b"]
            });
        });

        it('test action count', function () {
            var p;
            p = parser()
                .option("-a", "test count", {
                    "action": "count"
                });
            assert.deepEqual(p.parseArgv(["-a"]), {
                "A": 1
            });
            assert.deepEqual(p.parseArgv(["-a", "-a"]), {
                "A": 2
            });
            assert.deepEqual(p.parseArgv(["-a", "-aa"]), {
                "A": 3
            });
            assert.deepEqual(p.parseArgv(["-aaaaaa"]), {
                "A": 6
            });
        });

        it('test custom action', function () {
            var p;
            p = parser()
                .action("split", function(value, memo){
                    if(value){
                        return value.split(",");
                    }
                }, true)
                .option("-a", "test custom", {
                    "action": "split"
                });
            assert.deepEqual(p.parseArgv(["-a"]), {});
            assert.deepEqual(p.parseArgv(["-a", "1,2,3,4"]), {
                "A": ["1","2","3","4"]
            });
        });
    });

    describe('Test types', function() {
        it('test function type', function () {
            var p;
            p = parser()
                .option("-a", "test function type", {
                    "type": "int",
                })
                .option("-b", "test function type", {
                    "type": function(value, error){
                        value = parseInt(value);
                        if(isNaN(value)){
                            value = "string";
                        }
                        return value;
                    }
                });
            assert.deepEqual(p.parseArgv(["-a", "12", "-b", "s"]), {
                "A": 12,
                "B": "string"
            });

            assert.deepEqual(p.parseArgv(["-a", "12b", "-b", "12"]), {
                "A": 12,
                "B": 12
            });

            /*
            assert.throws(p.parseArgv(["-a", "test", "-b", "12"]), {
                "B": 12
            });
            */
        });
    });
});