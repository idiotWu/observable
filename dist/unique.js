(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports', 'module', './core'], factory);
    } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        factory(exports, module, require('./core'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, mod, global.ObservableObject);
        global.unique = mod.exports;
    }
})(this, function (exports, module, _core) {
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _ObservableObject2 = _interopRequireDefault(_core);

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
            for (var _iterator = watchers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
        var descriptor = Object.getOwnPropertyDescriptor(obj, prop);

        if (descriptor && !descriptor.configurable) {
            return obj;
        }

        if (oldValue === undefined) {
            oldValue = obj[prop];
        }

        if (obj instanceof _ObservableObject2['default']) {
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

        Object.defineProperty(obj, prop, {
            get: function get() {
                return oldValue;
            },
            set: function set(newValue) {
                if (newValue === oldValue) {
                    return;
                }

                if (!this.hasOwnProperty(prop)) {
                    // redefine new value in instance
                    Object.defineProperty(this, prop, {
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

        _createClass(UniqueObserver, [{
            key: 'unique',
            value: function unique(prop, listener, value) {
                return watchProp(this, prop, listener, value);
            }
        }, {
            key: 'disunique',
            value: function disunique(prop, listener) {
                return unwatchProp(this, prop, listener);
            }
        }], [{
            key: 'watch',
            value: function watch(obj, prop, cb, value) {
                return watchProp(obj, prop, cb, value);
            }
        }, {
            key: 'unwatch',
            value: function unwatch(obj, prop, cb) {
                return unwatchProp(obj, prop, cb);
            }
        }]);

        return UniqueObserver;
    })(_ObservableObject2['default']);

    module.exports = UniqueObserver;
});