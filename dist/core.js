(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports', 'module'], factory);
    } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        factory(exports, module);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, mod);
        global.core = mod.exports;
    }
})(this, function (exports, module) {
    // const ES7_OBSERVE = typeof Object.observe === 'function' && Object.observe;
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var ES7_OBSERVE = false;
    var DEFAULT_ACCEPTS = ['add', 'update', 'delete'];

    var ObservableObject = (function () {
        /**
         * @constructor
         * @param {Object}       [obj]: initial object
         * @param {Function}      [cb]: changes listener
         * @param {Array}    [accepts]: a list of acceptable changes
         */

        function ObservableObject(obj, cb, accepts) {
            var _this = this;

            _classCallCheck(this, ObservableObject);

            obj = obj || {};
            cb = typeof cb === 'function' && cb;
            accepts = accepts || DEFAULT_ACCEPTS;

            Object.keys(obj).forEach(function (prop) {
                _this[prop] = obj[prop];
            });

            Object.defineProperties(this, {
                listeners: {
                    value: [],
                    writable: true,
                    enumerable: false,
                    configurable: false
                },
                pending: {
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

                this.listeners.push({
                    fn: cb,
                    accepts: accepts
                });
            }

            return this;
        }

        _createClass(ObservableObject, [{
            key: 'makeChanges',

            /**
             * @method
             * send changes to listener async
             * @param {Array | String}     props: changed properties
             * @param {Array | String}     types: changes types
             * @param {Array | *}      oldValues: old values
             */
            value: function makeChanges(props, types, oldValues) {
                var _this2 = this;

                if (ES7_OBSERVE) {
                    return this;
                }

                clearTimeout(this.pending.timer);

                props = [].concat(props);
                types = [].concat(types);
                oldValues = [].concat(oldValues);

                var changes = this.pending.changes;

                props.forEach(function (prop, index) {
                    var descriptor = Object.getOwnPropertyDescriptor(_this2, prop);

                    if (descriptor && (descriptor.hasOwnProperty('set') || descriptor.hasOwnProperty('get'))) {
                        return;
                    }

                    var type = types[index];
                    var change = {
                        name: prop,
                        type: type,
                        object: _this2
                    };

                    if (type === 'update' || type === 'delete') {
                        change.oldValue = oldValues[index];
                    }

                    changes.push(change);
                });

                this.pending.timer = setTimeout(function () {
                    if (!changes.length) return;

                    _this2.listeners.forEach(function (listener) {
                        var accepts = listener.accepts;

                        var acceptChanges = changes.filter(function (change) {
                            return accepts.indexOf(change.type) !== -1;
                        });

                        if (!acceptChanges.length) return;

                        setTimeout(function () {
                            return listener.fn(acceptChanges);
                        });
                    });

                    // some cleaning
                    _this2.pending.changes.length = 0;
                });

                return this;
            }
        }, {
            key: 'add',

            /**
             * @method
             * add new property to observable object
             * @param {String}  prop: property name to be add
             * @param {*}      value: property value
             */
            value: function add(prop, value) {
                if (this.hasOwnProperty(prop)) {
                    return this.update(prop, value);
                }

                this[prop] = value;

                return this.makeChanges(prop, 'add');
            }
        }, {
            key: 'update',

            /**
             * @method
             * update property value
             * @param {String} prop
             * @param {*}      newValue
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

                return this.makeChanges(prop, 'update', oldValue);
            }
        }, {
            key: 'set',

            /**
             * @method
             * syntax sugar for instance.add | instance.update
             * @param {String} prop
             * @param {*}      value
             */
            value: function set(prop, value) {
                return this.add(prop, value);
            }
        }, {
            key: 'delete',

            /**
             * @method
             * delete property
             * @param {String} prop
             */
            value: function _delete(prop) {
                var oldValue = this[prop];

                return delete this[prop] ? this.makeChanges(prop, 'delete', oldValue) : this;
            }
        }, {
            key: 'observe',

            /**
             * @method
             * add new observe listener
             * @param {Function}        cb: listener
             * @param {Array}    [accepts]: a list of acceptable changes
             */
            value: function observe(cb, accepts) {
                accepts = accepts || DEFAULT_ACCEPTS;

                if (typeof cb === 'function') {
                    if (ES7_OBSERVE) {
                        return ES7_OBSERVE(this, cb, accepts);
                    }

                    this.listeners.push({
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
             * remove observe listener
             * @param {Function} cb
             */
            value: function unobserve(cb) {
                if (ES7_OBSERVE) {
                    return Object.unobserve(this, cb);
                }

                this.listeners.some(function (listener, index, listeners) {
                    return listener.fn === cb && listeners.splice(index, 1);
                });

                return this;
            }
        }]);

        return ObservableObject;
    })();

    module.exports = ObservableObject;
});