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

## Examples

```javascript
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