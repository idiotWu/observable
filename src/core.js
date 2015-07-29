const ES7_OBSERVE = typeof Object.observe === 'function' && Object.observe;
// const ES7_OBSERVE = false;
const DEFAULT_ACCEPTS = ['add', 'update', 'delete'];

class ObservableObject {
    /**
     * @constructor
     * @param {Object}       [obj]: initial object
     * @param {Function}      [cb]: changes listener
     * @param {Array}    [accepts]: a list of acceptable changes
     *
     * @return {Object} this
     */
    constructor(obj, cb, accepts = DEFAULT_ACCEPTS) {
        cb = typeof cb === 'function' && cb;

        if (obj) {
            Object.keys(obj).forEach((prop) => {
                this[prop] = obj[prop];
            });
        }

        Object.defineProperties(this, {
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
    __makeChanges(prop, type, oldValue) {
        if (ES7_OBSERVE || !this.__listeners.length) {
            return this;
        }

        let descriptor = Object.getOwnPropertyDescriptor(this, prop);

        if (descriptor &&
            (
                descriptor.hasOwnProperty('set') ||
                descriptor.hasOwnProperty('get')
            )
        ) {
            return this;
        }

        clearTimeout(this.__pending.timer);

        let all = this.__pending.changes;
        let change = {
            name: prop,
            type: type,
            object: this
        };

        if (type.match(/update|delete/)) {
            change.oldValue = oldValue;
        }

        all.push(change);

        this.__pending.timer = setTimeout(() => {
            this.__listeners.forEach((listener) => {
                let accepts = listener.accepts;

                let acceptChanges = all.filter((ch) => {
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
     * add new property to observable object
     * @param {String}  prop: property name to be add
     * @param {Any}    value: property value
     *
     * @return {Object} this
     */
    add(prop, value) {
        if (this.hasOwnProperty(prop)) {
            return this.update(prop, value);
        }

        this[prop] = value;

        return this.__makeChanges(prop, 'add');
    }

    /**
     * @method
     * update property value
     * @param {String} prop
     * @param {Any}    newValue
     *
     * @return {Object} this
     */
    update(prop, newValue) {
        if (!this.hasOwnProperty(prop)) {
            return this.add(prop, newValue);
        }

        let oldValue = this[prop];

        if (oldValue === newValue) {
            return this;
        }

        this[prop] = newValue;

        return this.__makeChanges(prop, 'update', oldValue);
    }

    /**
     * @method
     * syntax sugar for instance.add | instance.update
     * @param {String} prop
     * @param {Any}    value
     *
     * @return {Object} this
     */
    set(prop, value) {
        return this.add(prop, value);
    }

    /**
     * @method
     * delete property
     * @param {String} prop
     *
     * @return {Object} this
     */
    delete(prop) {
        let oldValue = this[prop];

        return delete this[prop] ?
            this.__makeChanges(prop, 'delete', oldValue) : this;
    }

    /**
     * @method
     * add new observe listener
     * @param {Function}        cb: listener
     * @param {Array}    [accepts]: a list of acceptable changes
     *
     * @return {Object} this
     */
    observe(cb, accepts = DEFAULT_ACCEPTS) {
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
     * remove observe listener
     * @param {Function} cb
     *
     * @return {Object} this
     */
    unobserve(cb) {
        if (ES7_OBSERVE) {
            return Object.unobserve(this, cb);
        }

        this.__listeners.some((listener, index, listeners) => {
            return listener.fn === cb && listeners.splice(index, 1);
        });

        return this;
    }
}

export default ObservableObject;
