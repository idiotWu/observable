const ES7_OBSERVE = typeof Object.observe === 'function' && Object.observe;
// const ES7_OBSERVE = false;
const DEFAULT_ACCEPTS = ['add', 'update', 'delete'];

class ObservableObject {
    /**
     * @constructor
     * @param {Object}       [obj]: initial object
     * @param {Function}      [cb]: changes listener
     * @param {Array}    [accepts]: a list of acceptable changes
     */
    constructor(obj, cb, accepts = DEFAULT_ACCEPTS) {
        cb = typeof cb === 'function' && cb;

        if (obj) {
            Object.keys(obj).forEach((prop) => {
                this[prop] = obj[prop];
            });
        }

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

    /**
     * @method
     * send changes to listener async
     * @param {Array | String}     props: changed properties
     * @param {Array | String}     types: changes types
     * @param {Array | *}      oldValues: old values
     */
    makeChanges(props, types, oldValues) {
        if (ES7_OBSERVE) {
            return this;
        }

        clearTimeout(this.pending.timer);

        props = [].concat(props);
        types = [].concat(types);
        oldValues = [].concat(oldValues);

        let changes = this.pending.changes;

        props.forEach((prop, index) => {
            let descriptor = Object.getOwnPropertyDescriptor(this, prop);

            if (descriptor &&
                (
                    descriptor.hasOwnProperty('set') ||
                    descriptor.hasOwnProperty('get')
                )
            ) {
                return;
            }

            let type = types[index];
            let change = {
                name: prop,
                type: type,
                object: this
            };

            if (type === 'update' || type === 'delete') {
                change.oldValue = oldValues[index];
            }

            changes.push(change);
        });

        this.pending.timer = setTimeout(() => {
            if (!changes.length) return;

            this.listeners.forEach((listener) => {
                let accepts = listener.accepts;

                let acceptChanges = changes.filter((change) => {
                    return accepts.indexOf(change.type) !== -1;
                });

                if (!acceptChanges.length) return;

                setTimeout(() => listener.fn(acceptChanges));
            });

            // some cleaning
            this.pending.changes.length = 0;
        });

        return this;
    }

    /**
     * @method
     * add new property to observable object
     * @param {String}  prop: property name to be add
     * @param {*}      value: property value
     */
    add(prop, value) {
        if (this.hasOwnProperty(prop)) {
            return this.update(prop, value);
        }

        this[prop] = value;

        return this.makeChanges(prop, 'add');
    }

    /**
     * @method
     * update property value
     * @param {String} prop
     * @param {*}      newValue
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

        return this.makeChanges(prop, 'update', oldValue);
    }

    /**
     * @method
     * syntax sugar for instance.add | instance.update
     * @param {String} prop
     * @param {*}      value
     */
    set(prop, value) {
        return this.add(prop, value);
    }

    /**
     * @method
     * delete property
     * @param {String} prop
     */
    delete(prop) {
        let oldValue = this[prop];

        return delete this[prop] ?
            this.makeChanges(prop, 'delete', oldValue) : this;
    }

    /**
     * @method
     * add new observe listener
     * @param {Function}        cb: listener
     * @param {Array}    [accepts]: a list of acceptable changes
     */
    observe(cb, accepts = DEFAULT_ACCEPTS) {
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

    /**
     * @method
     * remove observe listener
     * @param {Function} cb
     */
    unobserve(cb) {
        if (ES7_OBSERVE) {
            return Object.unobserve(this, cb);
        }

        this.listeners.some((listener, index, listeners) => {
            return listener.fn === cb && listeners.splice(index, 1);
        });

        return this;
    }
}

export default ObservableObject;
