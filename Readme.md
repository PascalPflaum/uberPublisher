# SYNOPSIS

uber.publisher is an extended version of the EventEmitter module you can find in Node.js.
It supports wildcards, namespaces and multi event emitting

# DESCRIPTION

### FEATURES
 - Namespaces
 - Wildcards
 - Once


### Differences

 - uber.publisher constructor takes an optional object. This object will be extended with the publisher functionality. If no object is given, a new one will be returned.
 
```javascript
    var Publisher = require('uber.publisher');
    var instance = new MyOwnConstructor();
    var publisher = new Publisher(instance);
```

 - Namespaces are passed as seperate strings during subscribing and calles as array during emit

```javascript
   publisher.on('top', 'tierA', 'tierB', 'bottom', function(text) {
      console.log('text');
    });
   publisher.emit(['top', 'tierA', 'tierB', 'bottom'], 'hello', 'more payload');
```
