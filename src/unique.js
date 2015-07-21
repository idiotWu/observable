import ObservableObject from './core';

let watches = [];

/**
 * get listeners
 * @param {Object} obj: object to be spied on
 * @param {String} prop: property to be spied on
 */
let getListeners = (obj, prop) => {
    let listeners;

    watches.some(function(watch) {
        if (watch.object === obj && watch.property === prop) {
            listeners = watch.listeners;
            return true;
        }
    });

    return listeners;
};

/**
 * @method
 * create observer for one property in any object
 * @param {Object}   obj: target object
 * @param {String}   prop: property name
 * @param {Function} cb: changes' listener
 * @param {*}        [value]: initial value for the property
 */
let watchProp = (obj, prop, cb, value) => {
    let descriptor = Object.getOwnPropertyDescriptor(obj, prop);

    if (descriptor && !descriptor.configurable) {
        return obj;
    }

    value = value || obj[prop];

    if (obj instanceof ObservableObject) {
        obj.set(prop, value);
    }

    let listeners = getListeners(obj, prop);

    if (!listeners) {
        listeners = [];
        watches.push({
            object: obj,
            property: prop,
            listeners: listeners
        });
    }

    if (typeof cb === 'function') {
        listeners.push(cb);
    }

    Object.defineProperty(obj, prop, {
        get() {
            return value;
        },
        set(newValue) {
            if (newValue === value) {
                return;
            }

            let oldValue = value;
            value = newValue;
            let change = [{
                name: prop,
                type: 'update',
                object: obj,
                oldValue: oldValue
            }];
            listeners.forEach((fn) => {
                setTimeout(() => fn(change));
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
 */
let unwatchProp = (obj, prop, cb) => {
    let listeners = getListeners(obj, prop);

    if (!listeners) return;

    listeners.some((listener, index, listeners) => {
        return listener === cb && listeners.splice(index, 1);
    });

    return obj;
};

class UniqueObserver extends ObservableObject {
    /**
     * @method
     * create specific listener for one property
     * NOTICE: when apply unique listener to a property,
     *         any change on the property WILL NOT BE
     *         CAPTURED BY UNIVERSAL UPDATE LISTENERS!
     *
     * @param {String}       prop: target property name
     * @param {Function} listener: changes' listener
     * @param {*}         [value]: initial value for the property
     */
    unique(prop, listener, value) {
        return watchProp(this, prop, listener, value);
    }

    disunique(prop, listener) {
        return unwatchProp(this, prop, listener);
    }

    static watch(obj, prop, cb, value) {
        return watchProp(obj, prop, cb, value);
    }

    static unwatch(obj, prop, cb) {
        return unwatchProp(obj, prop, cb);
    }
}

export default UniqueObserver;
