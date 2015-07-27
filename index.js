
/**
 * Module dependencies.
 */
var path = require('path');
var commander = require('commander');

/**
 * Is value invalid
 * @param  {Any}  value
 * @return {Boolean}
 */
function isInvalid(value){
    return value === undefined;
}

/**
 * Use `action's` needInput function to print `option`.
 *
 * @param  {String}         action
 * @param  {Parser}         parser
 * @return {Function|NULL}
 */
function getOptionFormatter(action, parser) {
    action = action || 'store';
    var actionOption = parser._actions[action] || Parser._actions[action] || {};
    if(typeof actionOption.needInput == "function"){
        return actionOption.needInput;
    } else if(!!actionOption.needInput){
        return function(v){
            return v.toUpperCase();
        };
    }
}

/**
 * Get a function to print `argument`.
 *
 * @param  {String|Number} narg
 * @param  {Parser}        parser
 * @return {Function}
 */
function getArgumentFormatter(narg, parser) {
    var formatter = function(v) {
        return v;
    };
    switch(narg) {
        case 1:
        case '1':
        case '?':
            break;
        case "+":
        case "*":
            formatter = function(v) {
                return v + '...';
            };
            break;
        default:
            intNarg = parseInt(narg);
            if(intNarg < 5) {
                formatter = function(v) {
                    return Array(intNarg + 1).join(v + " ").trim();
                };
            } else {
                formatter = function(v) {
                    return v + '{' + intNarg + '}';
                };
            }
    }
    return formatter;
}

/**
 * Get `action` function to store `option`.
 *
 * @param  {String}   action
 * @param  {Parser}   parser
 * @return {Function}
 */
function getActionHandler(action, parser) {
    action = action || 'store';
    if(typeof action == "function"){
        return action;
    } else {
        var actionOption = parser._actions[action] || Parser._actions[action] || {};
        return actionOption.handler;
    }
}

/**
 * Get `type` function to convert `option` and `argument`.
 *
 * @param  {String|Function} type
 * @param  {Parser}          parser
 * @return {Function}
 */
function getTypeHandler(type, parser) {
    if(typeof type == "function"){
        return type;
    } else {
        var typeOption = parser._types[type] || Parser._types[type] || {};
        return typeOption.handler || function(v){return v;};
    }
}

/**
 * Format `commands` and `arguments`.
 *
 * @param  {String} label
 * @param  {Array}  options
 * @param  {Number} width
 * @param  {Number} offset
 * @return {String}
 */
function formatHelp(label, options, width, offset){
    options = options || [];
    width = Math.max(width, options.reduce(function(max, option) {
        return Math.max(max, option[0].length);
    }, 0));

    offset = offset === undefined ? 4 : offset;

    var lines = [];

    if(label){
        lines.push(label + ":\n");
    }

    options.forEach(function(option) {
        var len = Math.max(0, width - option[0].length);
        lines.push([
            Array(offset + 1).join(" "),
            option[0] + Array(len + 3).join(" "),
            option[1] || ''
        ].join(''));
    });
    return lines.join("\n");
}

/**
 * Error handler.
 */
function error() {
    console.error();
    var args = [];
    for(var i=0;i<arguments.length;i++){
        if(i === 0) {
            args.push("  error:" + arguments[0] || "");
        } else {
            args.push(arguments[i]);
        }
    }
    console.error.apply(console, args);
    console.error();
    process.exit(1);
}

/**
 * Command parser object.
 *
 * Examples:
 *
 *      new Parser()
 *          .option(['-f', '--file'], 'write file names', {
 *              'action': 'store_append',
 *              'required': true
 *          })
 *          .option('-a', 'append file', {
 *              'dest': 'mode',
 *              'action': 'store_const',
 *              'const': 'a'
 *          })
 *          .option('-w', 'write file', {
 *              'dest': 'mode',
 *              'action': 'store_const',
 *              'const': 'w'
 *          });
 *
 *      var parser = new Parser()
 *                       .description('run different commands');
 *      parser
 *          .command("init", "init project")
 *          .argument("path", "project path")
 *          .exec(function(options){
 *              console.log(options.path);
 *          });
 *
 *      parser
 *          .command("update", "update project")
 *          .option("--force", "do force", {
 *              "action": "store_true"
 *          })
 *          .exec(function(){
 *              console.log("update project");
 *          });
 *
 *      parser.parse();
 *
 * @param {String} name
 * @param {String} dest
 */
var Parser = function(name){
    name = name === undefined ? path.basename(process.argv[1]) : name;
    var self = this;
    this._commands = [];
    this._args = [];
    this._opts = [];
    this._usage = '';
    this._desc = '';
    this._addition = '';
    this._exec = null;

    this._actions = {};
    this._types = {};

    /**
     * Make a commander parser with `commands`, `Options` and `arguments`.
     * @param  {Commander} parser
     * @return {Commander}
     */
    this.makeParser = function(parser) {
        parser = parser || new commander.Command(name);
        var desc = self._desc ? [self._desc] : [];
        var argumentDescriptions = [];
        var commandDescriptions = [];

        usages = ["[-h]"];

        var flag_width = 0;
        var memo = {};

        /**
         * Add `option` to commander.
         * @param {Object} opt
         */
        function addOption(opt) {
            var usage;
            var actionHandler = getActionHandler(opt.opts.action, self);
            var typeHandler = getTypeHandler(opt.opts.type, self);
            var flags = opt.flags.join(", ");
            var optionFormatter = getOptionFormatter(opt.opts.action, self);
            if(optionFormatter){
                var metavar = optionFormatter(opt.opts.metavar || opt.dest);
                usage = opt.flags[0] + " " + metavar;
                if(opt.opts.required) {
                    flags += " <" + metavar + ">";
                } else {
                    flags += " [" + metavar + "]";
                    usage = "[" + usage + "]";
                }
            } else {
                usage = opt.flags[0];
                if(!opt.opts.required) {
                    usage = "[" + usage + "]";
                }
            }

            parser.option(flags, opt.help || '', function(value){
                if(typeHandler) {
                    value = typeHandler(value, error, opt);
                }
                value = actionHandler(value, memo[opt.dest], opt.opts, error);
                if(!isInvalid(value)) {
                    memo[opt.dest] = value;
                }
                return value;
            });

            usages.push(usage);

            flag_width = Math.max(flags.length, flag_width);
        }

        /**
         * Add `argument` to commander.
         * @param {Object} arg
         */
        function addArgument(arg) {
            var argumentFormatter = getArgumentFormatter(arg.opts.narg, self);
            var metavar = argumentFormatter(arg.opts.metavar || arg.name);
            argumentDescriptions.push([
                arg.opts.metavar || arg.name,
                arg.help || ''
            ]);
            if (!arg.opts.required || arg.opts.narg == '+') {
                usages.push("[" + metavar + "]");
            } else {
                usages.push(metavar);
            }
        }

        /**
         * Add `command` to commander.
         * @param {Object} cmd
         */
        function addCommand(cmd) {
            commandDescriptions.push([
                cmd.name,
                cmd.help || ''
            ]);
        }

        (self._commands || []).forEach(function(cmd) {
            addCommand(cmd);
        });
        if(self._commands.length > 0){
            usages.push("{" + self._commands.map(function(v){return v.name;}).join(",") + "}");
        }
        (self._opts || []).forEach(function(opt) {
            addOption(opt);
        });
        (self._args || []).forEach(function(arg) {
            addArgument(arg);
        });
        if(commandDescriptions.length > 0){
            desc.push(formatHelp("Commands", commandDescriptions, flag_width));
        }
        if(argumentDescriptions.length > 0){
            desc.push(formatHelp("Arguments", argumentDescriptions, flag_width));
        }
        if(desc.length > 0) {
            parser.description(desc.map(function(d, i) {
                if(i !== 0) {
                    d = "  " + d;
                }
                return d;
            }).join("\n\n"));
        }
        parser.usage(self._usage || usages.join(" "));
        if(self._addition){
            parser.on("--help", function(){
                console.log(self._addition);
            });
        }
        parser.memo = memo;
        return parser;
    };

    /**
     * Set `description`.
     * @param  {String} description
     * @return {Parser}
     */
    this.description = function(description) {
        this._desc = description;
        return this;
    };

    /**
     * Set `usage`.
     * @param  {String} usage
     * @return {Parser}
     */
    this.usage = function(usage) {
        this._usage = usage;
        return this;
    };

    /**
     * Set `addition`.
     * @param  {String} addition
     * @return {Parser}
     */
    this.addition = function(addition) {
        this._addition = addition;
        return this;
    };

    /**
     * Add `option`.
     * @param  {Array|String} flags
     * @param  {String}       help
     * @param  {Object}       opts  {dest,action,metavar,type,default}
     * @return {Parser}
     */
    this.option = function(flags, help, opts) {
        opts = opts || {};
        if(typeof flags == "string") {
            flags = [flags];
        }
        var name;
        flags = flags.map(function(flag) {
            flag = flag.replace(/[,\s\t].*$/, '');
            if(flag.slice(0, 2) == '--') {
                name = flag.slice(2);
            } else if(flag.slice(0, 1) == '-'){
                if(!name){
                    name = flag.slice(1).toUpperCase();
                }
            } else {
                name = flag;
            }
            return flag;
        });
        this._opts.push({
            flags: flags,
            help: help,
            dest: opts.dest || name,
            opts: opts
        });
        return this;
    };

    /**
     * Add `argument`.
     * @param  {String} name
     * @param  {String} help
     * @param  {Object} opts {dest,narg,metavar,type,default}
     * @return {Parser}
     */
    this.argument = function(name, help, opts) {
        opts = opts || {};
        this._args.push({
            help: help,
            name: name,
            dest: opts.dest || name,
            opts: opts
        });
        return this;
    };

    /**
     * Add `command`.
     * @param  {String} command
     * @param  {String} help
     * @return {Parser}
     */
    this.command = function(command, help) {
        var parser = new Parser(name + " " + command);
        this._commands.push({
            name: command,
            parser: parser,
            help: help
        });
        return parser;
    };

    /**
     * Print help.
     * @return {Parser}
     */
    this.help = function(){
        var parser = this.makeParser();
        parser.outputHelp();
        return this;
    };

    /**
     * Parse argv.
     * @param {Array} argv
     * @param {String} withCommand
     * @return {Object}
     */
    this.parse = function(argv, withCommand) {
        if(typeof argv == "string") {
            argv = undefined;
            withCommand = argv;
        }
        argv = argv === undefined ? process.argv : argv;
        var processArgv = argv.slice(0, 2);
        argv = argv.slice(2);
        var parser = this.makeParser();
        var options = null;

        var command = argv[0];
        if(command) {
            this._commands.forEach(function(cmd) {
                if(command == cmd.name) {
                    argv.shift();
                    options = cmd.parser.parse(processArgv.concat(argv));
                    if(withCommand) {
                        options[withCommand] = command;
                    }
                    return;
                }
            });
        }

        if(options === null) {

            parser.parse(processArgv.concat(argv));

            options = parser.memo;
            this._opts.forEach(function(opt){
                if(isInvalid(options[opt.dest])){
                    if(opt.opts.required) {
                        error("missing required option `%s'", opt.dest.toUpperCase());
                    }
                    if(!isInvalid(opt.opts.default)){
                        options[opt.dest] = opt.opts.default;
                    }
                }
            });

            var args = parser.args;
            this._args.forEach(function(arg) {
                var narg = arg.opts.narg || "?";
                var typeHandler = getTypeHandler(arg.opts.type, self);
                switch(narg) {
                    case 1:
                    case "1":
                    case "?":
                        if(args.length > 0){
                            options[arg.dest] = typeHandler(args.shift(), error);
                        }
                        break;
                    case "+":
                        if(args.length > 0){
                            options[arg.dest] = args.map(function(v){return typeHandler(v);});
                            args = [];
                        } else {
                            options[arg.dest] = [];
                            error("missing required argument `%s'", arg.dest.toUpperCase());
                        }
                        break;
                    case "*":
                        options[arg.dest] = args.map(function(v){return typeHandler(v);});
                        args = [];
                        break;
                    default:
                        intNarg = parseInt(narg);
                        options[arg.dest] = [];
                        if(!isNaN(intNarg) && intNarg == narg) {
                            for(var i=0;i<intNarg;i++){
                                if(args.length === 0 && arg.opts.required){
                                    error("missing required argument `%s' need: %s", arg.dest.toUpperCase(), intNarg);
                                    break;
                                }
                                options[arg.dest].push(typeHandler(args.shift()));
                            }
                        }
                        break;
                }

                if((!options[arg.dest] || options[arg.dest].length === 0) && arg.opts.required){
                    error("missing required argument `%s'", arg.dest.toUpperCase());
                }
                if((!options[arg.dest] || options[arg.dest].length === 0) && arg.opts.default){
                    options[arg.dest] = arg.opts.default;
                }
            });

            if(this._exec) {
                options = this._exec(options);
            }

        }

        return options;
    };

    /**
     * Parse argv.
     * @param  {Array} argv
     * @param  {String} withCommand
     * @return {Object}
     */
    this.parseArgv = function(argv, withCommand){
        argv = [null, null].concat(argv);
        return this.parse(argv, withCommand);
    };

    /**
     * Add `action`.
     * @param  {String} action
     * @param  {Function} handler
     * @param  {Boolean|Function} needInput
     * @return {Parser}
     */
    this.action = function(action, handler, needInput) {
        this._actions[action] = {
            handler: handler,
            needInput: !!needInput
        };
        return this;
    };

    /**
     * Add `type`.
     * @param  {String} type
     * @param  {Function} handler
     * @return {Parser}
     */
    this.type = function(type, handler) {
        this._types[type] = {
            handler: handler
        };
        return this;
    };

    /**
     * Add `executor`
     * @param  {Function} fn
     * @return {Parser}
     */
    this.exec = function(fn) {
        this._exec = fn;
        return this;
    };

};

Parser._actions = {};
Parser._types = {};

Parser.action = function(action, handler, needInput) {
    Parser._actions[action] = {
        handler: handler,
        needInput: !!needInput
    };
};

Parser.type = function(type, handler) {
    Parser._types[type] = {
        handler: handler
    };
};

Parser.isInvalid = isInvalid;

/**
 * Default command actions
 */

Parser.action("store", function(value) {
    return value;
}, true);

Parser.action("store_const", function(value, memo, opts) {
    return opts['const'];
});

Parser.action("store_true", function() {
    return true;
});

Parser.action("store_false", function() {
    return false;
});

Parser.action("append", function(value, memo) {
    if(memo === undefined) {
        memo = [value];
    } else {
        memo.push(value);
    }
    return memo;
}, true);

Parser.action("append_const", function(value, memo, opts) {
    var v = opts['const'];
    if(isInvalid(v)){
        return memo;
    }
    if(memo === undefined) {
        memo = [v];
    } else {
        memo.push(v);
    }
    return memo;
});

Parser.action("count", function(value, memo) {
    if(memo === undefined) {
        memo = 1;
    } else {
        memo += 1;
    }
    return memo;
});


/**
 * Default command types
 */
Parser.type("string", function(value, error, opt) {
    value = '' + value;
    if(!value){
        return undefined;
    }
    return value;
});

Parser.type("int", function(value, error, opt) {
    value = parseInt(value);
    if(isNaN(value)) {
        var name = opt.metavar || opt.dest;
        error("%s must be an integer.", name.toUpperCase());
    }
    return value;
});

Parser.type("float", function(value, error, opt) {
    value = parseFloat(value);
    if(isNaN(value)) {
        var name = opt.metavar || opt.dest;
        error("%s must be a float.", name.toUpperCase());
    }
    return value;
});

Parser.type("choice", function(value, error, opt){
    if(opt.choices && opt.choices.indexOf(value) == -1) {
        var name = opt.metavar || opt.dest;
        error("argument `%s' not in choices", name.toUpperCase());
    }
    return value;
});
/**
 * Expose function.
 */
module.exports = function(name) {
    return new Parser(name);
};
module.exports.Parser = Parser;
module.exports.action = Parser.action;
module.exports.type = Parser.type;
module.exports.isInvalid = isInvalid;

