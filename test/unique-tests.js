'use strict';

var expect = require('chai').expect;
var Observable = require('../dist/unique');

describe('======= UNIQUE OBSERVER TESTS ======', function() {
    describe('add unique listeners', function() {
        it('unique property should be captured only in unique listeners', function(done) {
            var observable = new Observable({
                a: 1,
                unq: 1
            });

            var uniqueListener = new Promise(function(resolve, reject) {
                observable.unique('unq', function(changes) {
                    changes.forEach(function(change) {
                        if (change.name !== 'unq') {
                            reject(new Error('common properties changes should not be captured by unique listener'));
                        }
                    });

                    resolve();
                });
            });

            var universalListener = new Promise(function(resolve, reject) {
                observable.observe(function(changes) {
                    changes.forEach(function(change) {
                        if (change.name === 'unq') {
                            reject(new Error('unique property changes should not be captured by universal listener'));
                        }
                    });

                    resolve();
                });
            });

            Promise.all([uniqueListener, universalListener]).then(function() {
                done();
            }).catch(done);

            observable.set('a', 2);
            observable.set('unq', 100);
        });

        it('unique listener can be add as many as you want', function(done) {
            var observable = new Observable();
            var count = 0;

            observable.unique('unq', function() {
                count++;
            });

            observable.unique('unq', function() {
                count += 2;
            });

            observable.unique('unq', function() {
                count += 3;

                try {
                    expect(count).to.equal(1 + 2 + 3);
                } catch (e) {
                    return done(e);
                }
                done();
            });

            observable.set('unq', 1);
        });

        it('listeners should not be invoked when value isn\'t change', function(done) {
            var observable = new Observable();
            var finished = false;

            observable.unique('unq', function(changes) {
                if (finished) return;

                finished = true;

                if (observable.unq !== 10) {
                    return done(new Error('value unchange but listener invoked'));
                }

                done();
            }, 1);

            observable.unq = 1;

            setTimeout(function() {
                observable.unq = 10;
            });
        });
    });

    describe('remove unique listener', function() {
        it('changes should not be captured by removed listener', function(done) {
            var observable = new Observable();

            var listener = function() {
                done(new Error('first listener isn\'t removed'));
            };

            observable.unique('unq', listener);
            observable.unique('unq', function() {
                done();
            });

            observable.disunique('unq', listener);
            observable.set('unq', 1);
        });
    });

    describe('unique as static method', function() {
        describe('add listeners', function() {
            it('listeners can be add to same property of different objects', function(done) {
                var obj_1 = {
                    unq: 1
                };
                var obj_2 = {
                    unq: 2
                };

                Observable.watch(obj_1, 'unq', function(changes) {
                    try {
                        expect(changes.length).to.equal(1);
                        expect(changes[0].oldValue).to.equal(1);
                    } catch (e) {
                        done(e);
                    }
                });

                Observable.watch(obj_2, 'unq', function(changes) {
                    try {
                        expect(changes.length).to.equal(1);
                        expect(changes[0].oldValue).to.equal(2);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                obj_1.unq = 10;
                obj_2.unq = 10;
            });
        });

        describe('remove listener', function() {
            it('listener on obj_1 should be removed', function(done) {
                var obj_1 = {
                    unq: 1
                };
                var obj_2 = {
                    unq: 2
                };

                var listener_1 = function(changes) {
                    done(new Error('first listener isn\'t removed'));
                };

                Observable.watch(obj_1, 'unq', listener_1);

                Observable.watch(obj_2, 'unq', function() {
                    done();
                });

                Observable.unwatch(obj_1, 'unq', listener_1);

                obj_1.unq = 10;
                obj_2.unq = 10;
            });

            it('call Observable.unwatch() to unexist prop should make no difference', function(done) {
                var obj_1 = {
                    unq: 1
                };

                var listener_1 = function(changes) {
                    done();
                };

                Observable.watch(obj_1, 'unq', listener_1);

                Observable.unwatch(obj_1, 'wow', listener_1);

                obj_1.unq = 10;
            });
        });
    });

    describe('observed object as prototype of other objects', function() {
        it('instance own property should be individual from prototype', function() {
            var proto = {
                unq: 1
            };

            var instance = Object.create(proto);

            Observable.watch(proto, 'unq');

            instance.unq = 2;

            expect(instance.unq, 'instance property hasn\'t been changed').to.equal(2);
            expect(proto.unq, 'prototype property has been changed').to.equal(1);
        });

        it('instance own property should be mutable', function() {
            var proto = {
                unq: 1
            };

            var instance = Object.create(proto);

            Observable.watch(proto, 'unq');

            instance.unq = 2;
            expect(instance.unq, 'instance property hasn\'t be inited with 2').to.equal(2);

            instance.unq = 3;
            expect(instance.unq, 'instance property hasn\'t be updated to 3').to.equal(3);

            try {
                Object.defineProperty(instance, 'unq', {
                    value: 100
                });
            } catch (e) {
                throw new Error('instance property isn\'t configurable');
            }
            expect(instance.unq, 'instance property hasn\'t be redefined as 100').to.equal(100);
        });
    });
});
