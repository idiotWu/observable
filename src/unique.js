import { nonenumerable, nonconfigurable } from 'core-decorators';
import ObservableObject from './core';

let watchers = [];

/**
 * get watcher
 * @param {Object} obj: object to be spied on
 * @param {String} prop: property to be spied on
 *
 * @return {Object} watcher
 */
 let getWatcher = (obj, prop) => {
     for (let watcher of watchers) {
        if (watcher.object === obj && watcher.property === prop) {
            return watcher;
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
let watchProp = (obj, prop, cb, oldValue) => {
    if (!obj instanceof Object) {
        throw new Error('Obsevable.watch called on non-object');
    }

    if (!prop) return obj;

    let descriptor = Object.getOwnPropertyDescriptor(obj, prop);

    if (descriptor && !descriptor.configurable) {
        return obj;
    }

    if (oldValue === undefined) {
        oldValue = obj[prop];
    }

    if (obj instanceof ObservableObject) {
        obj.set(prop, oldValue);
    } else {
        obj[prop] = oldValue;
    }

    let watcher = getWatcher(obj, prop);

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
        get() {
            return oldValue;
        },
        set(newValue) {
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

            let all = watcher.pending.changes;
            let change = {
                name: prop,
                type: 'update',
                object: obj,
                oldValue: oldValue
            };

            oldValue = newValue;
            all.push(change);

            watcher.pending.timer = setTimeout(() => {
                watcher.listeners.forEach((fn) => {
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
let unwatchProp = (obj, prop, cb) => {
    if (!obj instanceof Object) {
        throw new Error('Obsevable.unwatch called on non-object');
    }

    let watcher = getWatcher(obj, prop);

    if (!watcher) {
        return obj;
    }

    watcher.listeners.some((listener, index, all) => {
        return listener === cb && all.splice(index, 1);
    });

    return obj;
};

class UniqueObserver extends ObservableObject {
    @nonenumerable
    @nonconfigurable
    unique(...args) {
        return watchProp(this, ...args);
    }

    @nonenumerable
    @nonconfigurable
    disunique(...args) {
        return unwatchProp(this, ...args);
    }

    @nonenumerable
    @nonconfigurable
    static watch(obj, ...args) {
        return watchProp(obj, ...args);
    }

    @nonenumerable
    @nonconfigurable
    static unwatch(obj, ...args) {
        return unwatchProp(obj, ...args);
    }
}

export default UniqueObserver;
