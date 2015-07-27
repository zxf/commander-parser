# Commander-Parser.js


[![Build Status](https://travis-ci.org/zxf/commander-parser.svg?branch=master)](https://travis-ci.org/zxf/commander-parser)

  A command-line parser for [node.js](http://nodejs.org) like python's `argparser`, inspired by [commander.js](https://github.com/tj/commander.js).

## Command

```javascript
var command = parser().command(<command>, <help>)
```

## Argument

```javascript
parser().argument(<name>, <help>, {
    "narg": <narg> ,
    "required": <boolean>,
    "dest": <dest>,
    "const": <conse>,
    "type": <type>
})
```


## Option

```javascript
parser().option(<flag>, <help>, {
    "action": <action> ,
    "required": <boolean>,
    "dest": <dest>,
    "const": <conse>,
    "type": <type>
})
```

## Command
```
parser().command(<name>, <help>);
```

## Methods

### `parser(name)`

Return an instance of parser.Parser.

* `name`: The name of the program(default: `process.argv[1]`)


### `class parser.Parser(name)`

Create a new Parser object.

* `name`: The name of the program(default: `process.argv[1]`)

### `action(name, handler, needInput)`

* `name`: The name of the Action.

* `handler`: The handler of the Action.

    arguments: handler arguments.

    * `value`: raw value.
    * `memo`: dest memo.
    * `options`: options.

### `type(name, handler)`

* `name`: The name of the Type.

* `handler`: The handler of the Type.

    arguments: handler arguments.

    * `value`: raw value.
    * `error`: error handler.
    * `options`: options.



## `Parser()` Methods

### `usage(usage)`

Return parser.

* `usage`: The string describing the program usage(default: generated from arguments added to parser)

### `description(description)`

Return parser.

* `description`: The string describing the program.

### `addition(addition)`

Return parser.

* `addition`: Additional messages of the program.


### `argument(name, help, options={})`

Return parser.

* `name`: The name of the argument.
* `help`: The string describing the argument.
* `options`: Other options.
    * `narg`: How many arguments of type type should be consumed when this option is seen. If > 1, parser will store a array of values to dest.(default: `1`)
    * `required`: The value is required.
    * `default`: The value to use for this argument’s destination if the argument is not seen on the command line.
    * `dest`: This tells parser where to write it.
    * `type`: The argument type expected (e.g., "string" or "int"); the available types are [`"int"`, `"float"`, `"string"`, `"choice"`, `<function>`].You can registry custom types by `parser.type`.
    * `choices`: For options of type "choice", the list of strings the user may choose from.


### `option(flag, help, options={})`

Return parser.

* `flag`: The flags of the option.
* `help`: The string describing the option.
* `options`: Other options.
    * `action`: Determines parser‘s behaviour when this option is seen on the command line; the available options are [`"store"`, `"store_const"`, `"store_true"`, `"store_false"`, `"append"`, `"append_const"`, `"count"`].(default `"store"`) You can registry custom actions by `parser.action`.
    * `required`: The value is required.
    * `default`: The value to use for this argument’s destination if the argument is not seen on the command line.
    * `dest`: This tells parser where to write it.
    * `type`: The argument type expected (e.g., `"string"` or `"int"`); the available types are [`"int"`, `"float"`, `"string"`, `"choice"`, `<function>`].You can registry custom types by `parser.type`.
    * `const`: For actions that store a constant value, the constant value to store.
    * `choices`: For options of type "choice", the list of strings the user may choose from.

### `command(name, help)`

Return command parser.

* `name`: The name of the command.
* `help`: The string describing the command.

### `help()`

Print parser's usage.

### `exec(function)`

Return parser.

* `function`: This function will be called when calling parser.parse.

* arguments:

  * options: The parsed command-line options.

### `parse(argv, withCommand=false)`

parse command-line options

* `argv`: command-line argvs with ["node", `<script>`].(default: `process.argv`)

* `withCommand`: If this is a string.Parsed options'key `"command"` will be command name.


### `parseArgv(argv, withCommand=false)`

like parse, but argv without ["node", `<script>`]


### `action(name, handler, needInput)`

* `name`: The name of the Action.

* `handler`: The handler of the Action.

    arguments: handler arguments.

    * `value`: raw value.
    * `memo`: dest memo.
    * `options`: options.

### `type(name, handler)`

* `name`: The name of the Type.

* `handler`: The handler of the Type.

    arguments: handler arguments.

    * `value`: raw value.
    * `error`: error handler.
    * `options`: options.




## Examples

```javascript
var parser = require("commander-parser");

parser()
    .option(['-f', '--file'], 'write file names', {
        'action': 'store_append',
        'required': true
    })
    .option('-a', 'append file', {
        'dest': 'mode',
        'action': 'store_const',
        'const': 'a'
    })
    .option('-w', 'write file', {
        'dest': 'mode',
        'action': 'store_const',
        'const': 'w'
    });
```