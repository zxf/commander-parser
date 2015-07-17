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