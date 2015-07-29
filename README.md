## observable.js [![Build Status][travis-image]][travis-url]

[![NPM](https://nodei.co/npm/observable.js.png)](https://nodei.co/npm/observable.js)

A library provides you a way to listen changes on a object.

### Install

```
npm install observable.js
```

## Basical Usage

```javascript
var Observable = require('observable.js');

var obs = new Observable(object, listener, accepts);
```

The above code will create an observable object `obs`, here's the explanation of three parameters:

1. `object`: `Object, optional`. Initial object, all the properties will be copied to observable object
2. `listener`: `Function, optional`. Observer listener for the changes
3. `accepts`: `Array, optional`. Accepts list of changes, refer to [Object.observe](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe)

listener function is invoked with an array of changes:

> `changes`: An array of objects each representing a change. The properties of these change objects are:
>
> - `name`: The name of the property which was changed.
> - `object`: The changed object after the change was made.
> - `type`: A string indicating the type of change taking place. One of "add", "update", or "delete".
> - `oldValue`: Only for "update" and "delete" types. The value before the change.

### observable#add( String:prop, Any:value )

Add new property to the observable object, eg:

```javascript
var obs = new Observable(); // {}
obs.add('a', 1); // { a: 1 }
```

### observable#update( String:prop, Any:value )

Update existed property value, eg:

```javascript
var obs = new Observable({ a: 1 }); // { a: 1 }
obs.update('a', 2); // { a: 2 }
```

### observable#delete( String:prop )

Delete property from object, eg:

```javascript
var obs = new Observable({ a: 1 }); // { a: 1 }
obs.delete('a'); // {}
```

### observable#set( String:prop, Any:value )

Syntax suger for `obs#add` `obs#update`, this method will choose which one to use automatically, eg:

```javascript
var obs = new Observable(); // {}
obs.set('a', 1); // add: { a: 1 }
obs.set('a', 2); // update: { a: 2 }
```

### observable#observe( Function:listener [, Array:accepts ] )

Register listener to observable object.

### observable#unobserve( Function:listener )

Remove listener from all listeners on this observable object.

## Unique Observer

You can import `'dist/unique.js'` to get unique observer constructor.

### unique#unique( String:prop, Function:listener, Any:value )

Register unique listener to specific property, you can add as many listeners as you want.

**NOTICE: when apply unique listener to a property, any change on the property WILL NOT BE CAPTURED BY UNIVERSAL UPDATE LISTENERS!**

### unique#disunique( String:prop, Function:listener )

Remove unique listener on specific property.

### Unique.watch( Object:obj, String:prop, Function:listener, Any:value )

An universal method of registering unique listener to any object.

### Unique.unwatch( Object:obj, String:prop, Function:listener )

An universal method of removing unique listener on any object.

## Use in browser

Code is compiled to `umd` modules with [Babel](https://babeljs.io/), you can use `amd` loader like [RequireJS](http://requirejs.org/) to use it.

## LICENSE

MIT.