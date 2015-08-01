'use strict';

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _Object$defineProperties = require('babel-runtime/core-js/object/define-properties')['default'];

var _Object$getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _coreDecorators = require('core-decorators');

var ES7_OBSERVE = typeof Object.observe === 'function' && Object.observe;
// const ES7_OBSERVE = false;
var DEFAULT_ACCEPTS = ['add', 'update', 'delete'];

var ObservableObject = (function () {
    /**
     * @constructor
     * @param {Object}       [obj]: initial object
     * @param {Function}      [cb]: changes listener
     * @param {Array}    [accepts]: a list of acceptable changes
     */

    function ObservableObject(obj, cb) {
        var accepts = arguments.length <= 2 || arguments[2] === undefined ? DEFAULT_ACCEPTS : arguments[2];

        _classCallCheck(this, ObservableObject);

        cb = typeof cb === 'function' && cb;

        _Object$assign(this, obj);

        _Object$defineProperties(this, {
            __listeners: {
                value: [],
                writable: true,
                enumerable: false,
                configurable: false
            },
            __pending: {
                value: {
                    changes: []
                },
                writable: true,
                enumerable: false,
                configurable: false
            }
        });

        if (cb) {
            if (ES7_OBSERVE) {
                return ES7_OBSERVE(this, cb, accepts);
            }

            this.__listeners.push({
                fn: cb,
                accepts: accepts
            });
        }

        return this;
    }

    /**
     * @method
     * send changes to listener async
     * @param {String}             prop: changed property
     * @param {String}             type: changes type
     * @param {Any}            oldValue: old value
     *
     * @return {Object} this
     */

    _createDecoratedClass(ObservableObject, [{
        key: '__makeChanges',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function __makeChanges(prop, type, oldValue) {
            var _this = this;

            if (ES7_OBSERVE || !this.__listeners.length) {
                return this;
            }

            var descriptor = _Object$getOwnPropertyDescriptor(this, prop);

            if (descriptor && (descriptor.hasOwnProperty('set') || descriptor.hasOwnProperty('get'))) {
                return this;
            }

            clearTimeout(this.__pending.timer);

            var all = this.__pending.changes;
            var change = {
                name: prop,
                type: type,
                object: this
            };

            if (type.match(/update|delete/)) {
                change.oldValue = oldValue;
            }

            all.push(change);

            this.__pending.timer = setTimeout(function () {
                _this.__listeners.forEach(function (listener) {
                    var accepts = listener.accepts;

                    var acceptChanges = all.filter(function (ch) {
                        return accepts.indexOf(ch.type) !== -1;
                    });

                    if (!acceptChanges.length) return;

                    listener.fn(acceptChanges);
                });

                // some cleaning
                all.length = 0;
            });

            return this;
        }

        /**
         * @method
         * @chainable
         * add new property to observable object
         *
         * @param {String}  prop: property name to be add
         * @param {Any}    value: property value
         */

    }, {
        key: 'add',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function add(prop, value) {
            if (this.hasOwnProperty(prop)) {
                return this.update(prop, value);
            }

            this[prop] = value;

            return this.__makeChanges(prop, 'add');
        }

        /**
         * @method
         * @chainable
         * update property value
         *
         * @param {String} prop
         * @param {Any}    newValue
         */

    }, {
        key: 'update',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function update(prop, newValue) {
            if (!this.hasOwnProperty(prop)) {
                return this.add(prop, newValue);
            }

            var oldValue = this[prop];

            if (oldValue === newValue) {
                return this;
            }

            this[prop] = newValue;

            return this.__makeChanges(prop, 'update', oldValue);
        }

        /**
         * @method
         * @chainable
         * syntax sugar for instance.add | instance.update
         *
         * @param {String} prop
         * @param {Any}    value
         */

    }, {
        key: 'set',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function set(prop, value) {
            return this.add(prop, value);
        }

        /**
         * @method
         * @chainable
         * delete property
         *
         * @param {String} prop
         */

    }, {
        key: 'delete',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function _delete(prop) {
            var oldValue = this[prop];

            return delete this[prop] ? this.__makeChanges(prop, 'delete', oldValue) : this;
        }

        /**
         * @method
         * @chainable
         * add new observe listener
         *
         * @param {Function}        cb: listener
         * @param {Array}    [accepts]: a list of acceptable changes
         */

    }, {
        key: 'observe',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function observe(cb) {
            var accepts = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_ACCEPTS : arguments[1];

            if (typeof cb === 'function') {
                if (ES7_OBSERVE) {
                    return ES7_OBSERVE(this, cb, accepts);
                }

                this.__listeners.push({
                    fn: cb,
                    accepts: accepts
                });
            }

            return this;
        }

        /**
         * @method
         * @chainable
         * remove observe listener
         *
         * @param {Function} cb
         */

    }, {
        key: 'unobserve',
        decorators: [_coreDecorators.nonconfigurable, _coreDecorators.nonenumerable],
        value: function unobserve(cb) {
            if (ES7_OBSERVE) {
                return Object.unobserve(this, cb);
            }

            this.__listeners.some(function (listener, index, all) {
                return listener.fn === cb && all.splice(index, 1);
            });

            return this;
        }
    }]);

    return ObservableObject;
})();

exports['default'] = ObservableObject;
module.exports = exports['default'];