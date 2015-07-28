'use strict';

var expect = require('chai').expect;
var Observable = require('../dist/core');

describe('======= CORE TESTS ======', function() {
    describe('init observable', function() {
        describe('if ISN\'T constructed via new', function() {
            it('should throw a TypeError', function() {
                try {
                    Observable({});
                } catch (error) {
                    expect(error).to.be.an.instanceof(TypeError);
                }
            });
        });

        describe('with initial values', function() {
            var init = {
                a: 1,
                b: 2
            };

            it('Object.keys(instance) === ["a", "b"]', function() {
                var observable = new Observable(init);
                expect(observable).to.have.all.keys('a', 'b');
            });

            it('listener should recieve a change of type:"update"', function(done) {
                var observable = new Observable(init);
                observable.observe(function(changes) {
                    try {
                        expect(changes[0].type).to.equal('update');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.set('a', 10);
            });

            it('listener should recieve a change of name:"a"', function(done) {
                var observable = new Observable(init);
                observable.observe(function(changes) {
                    try {
                        expect(changes[0].name).to.equal('a');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.set('a', 10);
            });

            it('listener should recieve a change of oldValue:1', function(done) {
                var observable = new Observable(init);
                observable.observe(function(changes) {
                    try {
                        expect(changes[0].oldValue).to.equal(1);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.set('a', 10);
            });

            it('only changes of "delete" will be listened', function(done) {
                var observable = new Observable(init);
                observable.observe(function(changes) {
                    try {
                        expect(changes[0].type).to.equal('delete');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                }, ['delete']);

                observable.set('a', 10);
                observable.delete('a');
            });
        });
    });

    describe('actions', function() {
        describe('1:single action', function() {
            it('should recieve type:"add" and name:"biu"', function(done) {
                var observable = new Observable();

                observable.observe(function(changes) {
                    try {
                        expect(changes[0].type).to.equal('add');
                        expect(changes[0].name).to.equal('biu');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.add('biu', 1024);
            });

            it('should recieve type:"update" and oldValue:1', function(done) {
                var observable = new Observable({
                    biu: 1
                });

                observable.observe(function(changes) {
                    try {
                        expect(changes[0].type).to.equal('update');
                        expect(changes[0].oldValue).to.equal(1);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.update('biu', 1024);
            });

            it('should recieve type:"delete" and oldValue:1', function(done) {
                var observable = new Observable({
                    biu: 1
                });

                observable.observe(function(changes) {
                    try {
                        expect(changes[0].type).to.equal('delete');
                        expect(changes[0].oldValue).to.equal(1);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.delete('biu');
            });
        });

        describe('2:auto select action', function() {
            it('should change type from "add" to "update"', function(done) {
                var observable = new Observable({
                    a: 1
                });

                observable.observe(function(changes) {
                    try {
                        expect(changes[0].type).to.equal('update');
                        expect(changes[0].oldValue).to.equal(1);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.add('a', 1024);
            });

            it('should change type from "update" to "add"', function(done) {
                var observable = new Observable();

                observable.observe(function(changes) {
                    try {
                        expect(changes[0].type).to.equal('add');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.update('a', 1024);
            });

            it('should auto choose type when use instance.set()', function(done) {
                var observable = new Observable();

                observable.observe(function(changes) {
                    try {
                        expect(changes[0].type).to.equal('add');
                        expect(changes[1].type).to.equal('update');
                        expect(changes[1].oldValue).to.equal(1024);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.set('a', 1024);
                observable.set('a', 0);
            });

            it('should no invoke any listener when value don\'t change', function(done) {
                var observable = new Observable({
                    a: 1
                });

                observable.observe(function(changes) {
                    try {
                        expect(changes.length).to.equal(1);
                        expect(changes[0].type).to.equal('delete');
                        expect(changes[0].oldValue).to.equal(1);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.set('a', 1);
                observable.set('a', 1);
                observable.set('a', 1);
                observable.set('a', 1);
                observable.delete('a');
            });
        });

        describe('3:multiple actions in short period', function() {
            it('three changes at once should be handlered together', function(done) {
                var observable = new Observable();

                observable.observe(function(changes) {
                    try {
                        expect(changes.length).to.equal(3);
                        expect(changes[0].type).to.equal('add');
                        expect(changes[1].type).to.equal('update');
                        expect(changes[2].type).to.equal('delete');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.set('a', 0);
                observable.set('a', 1);
                observable.delete('a');
            });
        });
    });

    describe('listeners', function() {
        describe('add listeners', function() {
            it('listeners can be added as many as you want', function(done) {
                var observable = new Observable();
                var count = 0;

                observable.observe(function() {
                    count++;
                });

                observable.observe(function() {
                    count += 2;
                });

                observable.observe(function() {
                    count += 3;

                    try {
                        expect(count).to.equal(1 + 2 + 3);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });

                observable.set('a', 1);
                observable.set('a', 2);
                observable.delete('a');
            });

            it('listeners can be filtered by accepts list', function(done) {
                var observable = new Observable();

                observable.observe(function(changes) {
                    try {
                        expect(changes.length).to.equal(2);

                        changes.forEach(function(change) {
                            expect(change.type).to.equal('add');
                        });
                    } catch (e) {
                        done(e);
                    }
                }, ['add']);

                observable.observe(function(changes) {
                    try {
                        expect(changes.length).to.equal(4);

                        changes.forEach(function(change) {
                            expect(change.type).to.not.equal('add');
                        });
                    } catch (e) {
                        return done(e);
                    }
                    done();
                }, ['update', 'delete']);

                observable.set('a', 1);
                observable.set('b', 1);
                observable.set('a', 2);
                observable.set('b', 2);
                observable.delete('a');
                observable.delete('b');
            });
        });

        describe('remove listener', function() {
            it('changes should not be captured by removed listener', function(done) {
                var observable = new Observable();

                var listener = function() {
                    done(new Error('first listener isn\'t removed'));
                };

                observable.observe(listener);
                observable.observe(function(changes) {
                    done();
                });

                observable.unobserve(listener);
                observable.set('a', 1);
            });
        });
    });

    describe('observed object as prototype of other objects', function() {
        it('instance own property should be individual from prototype', function() {
            var proto = new Observable({
                unq: 1
            });

            var instance = Object.create(proto);

            instance.unq = 2;

            expect(instance.unq, 'instance property hasn\'t been changed').to.equal(2);
            expect(proto.unq, 'prototype property has been changed').to.equal(1);
        });

        it('instance own property should be mutable', function() {
            var proto = new Observable({
                unq: 1
            });

            var instance = Object.create(proto);

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
