## observable.js [![Build Status](https://travis-ci.org/idiotWu/observable.svg?branch=master)](https://travis-ci.org/idiotWu/observable)

[![NPM](https://nodei.co/npm/observable.js.png)](https://nodei.co/npm/observable.js)

[Object.observe](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe) is great, but it's hard to create a polyfill for the method.

MaxArt2501 has started a [polyfill](https://github.com/MaxArt2501/object-observe) but, actually I don't like dirty checking. So I create this repo to provide you another way to capture any change on an object.

### Install

```
npm install observable.js
```

## How it works

As MaxArt2501 has explained [here](https://github.com/MaxArt2501/object-observe/blob/master/doc/index.md#under-the-hood), we have no way to emulate this method other than dirty checking. **Instead of modifying object directly, we use some methods as proxy functions(we call them `modifiers`) to make changes and invoke listeners.**

If you are not annoyed with `Pub/Sub` model, welcome to the conversation :)

## Basical Usage

```javascript
import { Observable } from 'observable.js';
// or require('observable.js').Observable

let obs = new Observable(object, listener, accepts);
```

The above code will create an observable object `obs`, here's the explanation of three parameters:

1. `object`: Object, optional. Initial object, all the properties will be assigned to the observable instance
2. `listener`: `Function, optional`. Observer listener for the changes
3. `accepts`: `Array, optional`. Accepts list of changes, refer to [Object.observe](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe)

listener function is invoked with an array of changes(same as native `Object.observe`):

`changes`: An array of objects each representing a change. The properties of these change objects are:

- `name`: The name of the property which was changed.
- `object`: The changed object after the change was made.
- `type`: A string indicating the type of change taking place. One of "add", "update", or "delete".
- `oldValue`: Only for "update" and "delete" types. The value before the change.

eg:

```javascript
let obs = new Observable({ a:1 }, (changes) => {
    console.log(changes);
});

obs.set('a', 2);
// changes: [{
//    name: 'a',
//    object: { a: 2 },
//    type: 'update',
//    oldValue: 1
// }]
```

## Modifiers

### observable#add( String:prop, Any:value )

Add new property to the observable object, eg:

```javascript
let obs = new Observable(); // {}
obs.add('a', 1); // { a: 1 }
```

### observable#update( String:prop, Any:value )

Update existed property value, eg:

```javascript
let obs = new Observable({ a: 1 }); // { a: 1 }
obs.update('a', 2); // { a: 2 }
```

### observable#delete( String:prop )

Delete property from object, eg:

```javascript
let obs = new Observable({ a: 1 }); // { a: 1 }
obs.delete('a'); // {}
```

### observable#set( String:prop, Any:value )

Syntax suger for `obs#add` `obs#update`, this method will choose which one to use automatically, eg:

```javascript
let obs = new Observable(); // {}
obs.set('a', 1); // add: { a: 1 }
obs.set('a', 2); // update: { a: 2 }
```

### observable#observe( Function:listener [, Array:accepts ] )

Register listener to observable object.

### observable#unobserve( Function:listener )

Remove listener from all listeners on this observable object.

## Unique Observer

We also provide you a way to listen changes on single property by import `UniqueObsever`:

```javascript
import { UniqueObsever } from 'observable.js';
// or require('observable.js').UniqueObsever
```

### How it works

Unique observer is a sub class of `Observable` and accessing property through [`getter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) and [`setter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set). **Now you can modify the property directly like `obj.a = 1`.**

**NOTICE: when apply unique observer onto specific property, only changes of type:update will be captured!**

### unique#unique( String:prop, Function:listener, Any:value )

Register unique listener to specific property, you can add as many listeners as you want.

eg:

```javascript
let unq = new UniqueObsever();

unq.unique('a', (changes) => {
    console.log(changes);
});

unq.a = 2;
// changes: [{
//    name: 'a',
//    object: { a: 2 },
//    type: 'update',
//    oldValue: undefined
// }]
```

**NOTICE: when apply unique listener to a property, any change on the property WILL NOT BE CAPTURED BY LISTENERS REGIESTERED ON `Observable`!**

### unique#disunique( String:prop, Function:listener )

Remove unique listener on specific property.

### Unique.watch( Object:obj, String:prop, Function:listener, Any:value )

An universal method of registering unique listener to any object.

eg:

```javascript
let obj = {
    a: 1
};

UniqueObsever.watch(obj, 'a', (changes) => {
    console.log(changes);
});

obj.a = 2;
// changes: [{
//    name: 'a',
//    object: { a: 2 },
//    type: 'update',
//    oldValue: 1
// }]
```

### Unique.unwatch( Object:obj, String:prop, Function:listener )

An universal method of removing unique listener on any object.

## Limitations

1. Only changes made through `obs#add`, `obs#update`, `obs#set`, `obs#delete` will be captured

2. Don't support change types of "reconfigure", "setPrototype" or "preventExtensions"


## License

MIT.