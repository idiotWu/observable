'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _Object$defineProperties = require('babel-runtime/core-js/object/define-properties')['default'];

var _Object$getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
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

    _createClass(ObservableObject, [{
        key: '__makeChanges',

        /**
         * @method
         * send changes to listener async
         * @param {String}             prop: changed property
         * @param {String}             type: changes type
         * @param {Any}            oldValue: old value
         *
         * @return {Object} this
         */
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
    }, {
        key: 'add',

        /**
         * @method
         * @chainable
         * add new property to observable object
         *
         * @param {String}  prop: property name to be add
         * @param {Any}    value: property value
         */
        value: function add(prop, value) {
            if (this.hasOwnProperty(prop)) {
                return this.update(prop, value);
            }

            this[prop] = value;

            return this.__makeChanges(prop, 'add');
        }
    }, {
        key: 'update',

        /**
         * @method
         * @chainable
         * update property value
         *
         * @param {String} prop
         * @param {Any}    newValue
         */
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
    }, {
        key: 'set',

        /**
         * @method
         * @chainable
         * syntax sugar for instance.add | instance.update
         *
         * @param {String} prop
         * @param {Any}    value
         */
        value: function set(prop, value) {
            return this.add(prop, value);
        }
    }, {
        key: 'delete',

        /**
         * @method
         * @chainable
         * delete property
         *
         * @param {String} prop
         */
        value: function _delete(prop) {
            var oldValue = this[prop];

            return delete this[prop] ? this.__makeChanges(prop, 'delete', oldValue) : this;
        }
    }, {
        key: 'observe',

        /**
         * @method
         * @chainable
         * add new observe listener
         *
         * @param {Function}        cb: listener
         * @param {Array}    [accepts]: a list of acceptable changes
         */
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
    }, {
        key: 'unobserve',

        /**
         * @method
         * @chainable
         * remove observe listener
         *
         * @param {Function} cb
         */
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