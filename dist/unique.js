'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _coreDecorators = require('core-decorators');

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var watchers = [];

/**
 * get watcher
 * @param {Object} obj: object to be spied on
 * @param {String} prop: property to be spied on
 *
 * @return {Object} watcher
 */
var getWatcher = function getWatcher(obj, prop) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = _getIterator(watchers), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var watcher = _step.value;

            if (watcher.object === obj && watcher.property === prop) {
                return watcher;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
};

/**
 * @method
 * create observer for one property in any object
 * @param {Object}       obj: target object
 * @param {String}      prop: property name
 * @param {Function}    [cb]: changes' listener
 * @param {Any}   [oldValue]: initial value for the property
 *
 * @return {Object} target object
 */
var watchProp = function watchProp(obj, prop, cb, oldValue) {
    if (!obj instanceof Object) {
        throw new Error('Obsevable.watch called on non-object');
    }

    if (!prop) return obj;

    var descriptor = _Object$getOwnPropertyDescriptor(obj, prop);

    if (descriptor && !descriptor.configurable) {
        return obj;
    }

    if (oldValue === undefined) {
        oldValue = obj[prop];
    }

    if (obj instanceof _core2['default']) {
        obj.set(prop, oldValue);
    } else {
        obj[prop] = oldValue;
    }

    var watcher = getWatcher(obj, prop);

    if (!watcher) {
        watcher = {
            object: obj,
            property: prop,
            listeners: [],
            pending: {
                changes: []
            }
        };
        watchers.push(watcher);
    }

    if (typeof cb === 'function') {
        watcher.listeners.push(cb);
    }

    _Object$defineProperty(obj, prop, {
        get: function get() {
            return oldValue;
        },
        set: function set(newValue) {
            if (newValue === oldValue) {
                return;
            }

            if (!this.hasOwnProperty(prop)) {
                // redefine new value in instance
                _Object$defineProperty(this, prop, {
                    value: newValue,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });

                return;
            }

            clearTimeout(watcher.pending.timer);

            var all = watcher.pending.changes;
            var change = {
                name: prop,
                type: 'update',
                object: obj,
                oldValue: oldValue
            };

            oldValue = newValue;
            all.push(change);

            watcher.pending.timer = setTimeout(function () {
                watcher.listeners.forEach(function (fn) {
                    fn(all);
                });

                all.length = 0;
            });
        },
        enumerable: true,
        configurable: true
    });

    return obj;
};

/**
 * unwatch property changes
 * @param {Object}  obj: target object
 * @param {String} prop: property name
 * @param {Function} cb: listener to be remove
 *
 * @return {Object} target object
 */
var unwatchProp = function unwatchProp(obj, prop, cb) {
    if (!obj instanceof Object) {
        throw new Error('Obsevable.unwatch called on non-object');
    }

    var watcher = getWatcher(obj, prop);

    if (!watcher) {
        return obj;
    }

    watcher.listeners.some(function (listener, index, all) {
        return listener === cb && all.splice(index, 1);
    });

    return obj;
};

var UniqueObserver = (function (_ObservableObject) {
    _inherits(UniqueObserver, _ObservableObject);

    function UniqueObserver() {
        _classCallCheck(this, UniqueObserver);

        _get(Object.getPrototypeOf(UniqueObserver.prototype), 'constructor', this).apply(this, arguments);
    }

    _createDecoratedClass(UniqueObserver, [{
        key: 'unique',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function unique() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return watchProp.apply(undefined, [this].concat(args));
        }
    }, {
        key: 'disunique',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function disunique() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return unwatchProp.apply(undefined, [this].concat(args));
        }
    }], [{
        key: 'watch',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function watch(obj) {
            for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                args[_key3 - 1] = arguments[_key3];
            }

            return watchProp.apply(undefined, [obj].concat(args));
        }
    }, {
        key: 'unwatch',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function unwatch(obj) {
            for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                args[_key4 - 1] = arguments[_key4];
            }

            return unwatchProp.apply(undefined, [obj].concat(args));
        }
    }]);

    return UniqueObserver;
})(_core2['default']);

exports['default'] = UniqueObserver;
module.exports = exports['default'];