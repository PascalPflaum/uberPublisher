describe('uberPublisher', function () {

	var Publisher = require(path.join(PATH_TO_ROOT, 'publisher.js'));

	describe('can be applied from outside the constructor', function () {

		it('a listening event is called', function () {
			var demoInstance = {};
			Publisher(demoInstance);
			var spy = sinon.spy();
			demoInstance.on('channelA', spy);
			demoInstance.emit(['channelA'], 'Lorem Ipsum');
			assert.calledOnce(spy);
		});

	});


	describe('function registration', function () {

		it('constructors should have a "on" function', function () {
			var testVar = new Publisher();
			assert.isFunction(testVar.on);
		});

		it('constructors should have a "once" function', function () {
			var testVar = new Publisher();
			assert.isFunction(testVar.once);
		});

		it('constructors should have a "off" function', function () {
			var testVar = new Publisher();
			assert.isFunction(testVar.off);
		});

		it('constructors should have a "emit" function', function () {
			var testVar = new Publisher();
			assert.isFunction(testVar.emit);
		});
	});

	describe.skip('event aliases', function () {

		it('register and unregister with aliases', function () {
			var publisher = new Publisher();
			var spy = sinon.spy();
			publisher.on('top', spy, 'alias');
			publisher.emit('top');
			assert.calledOnce(spy);
			publisher.off('top', 'alias');
			publisher.emit('top');
			assert.calledOnce(spy);
		});

		it('register and unregister with aliases doesnt interfere with each other', function () {
			var publisher = new Publisher();
			var spyA = sinon.spy();
			var spyB = sinon.spy();
			publisher.on('top', spyA, 'aliasA');
			publisher.on('top', spyB, 'aliasB');
			publisher.emit('top');
			assert.calledOnce(spyA);
			assert.calledOnce(spyB);
			publisher.off('top', 'aliasA');
			publisher.emit('top');
			assert.calledOnce(spyA);
			assert.calledTwice(spyB);
		});

		it('register with alias, unregister with callback', function () {
			var publisher = new Publisher();
			var spy = sinon.spy();
			publisher.on('top', spy, 'alias');
			publisher.emit('top');
			assert.calledOnce(spy);
			publisher.off('top', spy);
			publisher.emit('top');
			assert.calledOnce(spy);
		});

		it('register via once and unregister with aliases', function () {
			var publisher = new Publisher();
			var spy = sinon.spy();
			publisher.once('top', spy, 'alias');
			publisher.off('top', 'alias');
			publisher.emit('top');
			assert.notCalled(spy);
		});

		it('register with alias via once, unregister with callback', function () {
			var publisher = new Publisher();
			var spy = sinon.spy();
			publisher.once('top', spy, 'alias');
			publisher.off('top', spy);
			publisher.emit('top');
			assert.notCalled(spy);
		});

	});

	describe('#once', function () {
		it('calls an event only once', function () {
			var publisher = new Publisher();
			var topSpy = sinon.spy();
			publisher.once('top', topSpy);
			publisher.emit('top');
			publisher.emit('top');
			assert.calledOnce(topSpy);
		});
	});


	describe('#on', function () {

		describe('Hierarchical events', function () {

			it('all listeners are triggered', function () {
				var publisher = new Publisher();

				var topSpy = sinon.spy();
				var tierASpy = sinon.spy();
				var tierBSpy = sinon.spy();
				var bottomSpy = sinon.spy();

				publisher.on('top', topSpy);
				publisher.on('top', 'tierA', tierASpy);
				publisher.on('top', 'tierA', 'tierB', tierBSpy);
				publisher.on('top', 'tierA', 'tierB', 'bottom', bottomSpy);
				publisher.emit(['top', 'tierA', 'tierB', 'bottom']);
				assert.calledOnce(topSpy);
				assert.calledOnce(tierASpy);
				assert.calledOnce(tierBSpy);
				assert.calledOnce(bottomSpy);
				publisher.emit(['top', 'tierA', 'tierB']);
				assert.callCount(topSpy, 2);
				assert.callCount(tierASpy, 2);
				assert.callCount(tierBSpy, 2);
				assert.calledOnce(bottomSpy);
				publisher.emit(['top', 'tierA']);
				assert.callCount(topSpy, 3);
				assert.callCount(tierASpy, 3);
				assert.callCount(tierBSpy, 2);
				assert.calledOnce(bottomSpy);
				publisher.emit(['top']);
				assert.callCount(topSpy, 4);
				assert.callCount(tierASpy, 3);
				assert.callCount(tierBSpy, 2);
				assert.calledOnce(bottomSpy);
			});

			it('should deliver back the publisher for function chaining', function () {
				var publisher = new Publisher();
				assert.equal(publisher, publisher.on("Test", function () {
				}));
			});

			it('error, if no callback given', function () {
				var publisher = new Publisher();
				assert.throw(function () {
					publisher.on("test");
				}, /illegal argument/);
			});

			it('the event is registered after an on', function () {

				var publisher = new Publisher();
				function TestingMock() {
				}
				publisher.on('test', TestingMock);
				assert.equal(publisher.getListener().next.test.callbacks[0].callback, TestingMock);
			});

			it('reregistration is an option', function () {

				var publisher = new Publisher();
				function TestingMock() {
				}

				publisher.on('test', TestingMock);
				assert.equal(publisher.getListener().next.test.callbacks[0].callback, TestingMock);
				publisher.off('test', TestingMock);
				assert.lengthOf(publisher.getListener().next.test.callbacks, 0);
				publisher.on('test', TestingMock);
				assert.equal(publisher.getListener().next.test.callbacks[0].callback, TestingMock);
				assert.lengthOf(publisher.getListener().next.test.callbacks, 1);
			});

		});

		describe('#off', function () {

			it('should simply do nothing, if eventChannel doesn\'t exists', function () {
				var publisher = new Publisher();
				assert.doesNotThrow(function () {
					publisher.off('test');
				});
			});

			it('should simply do nothing, if callback doesn\'t exists', function () {

				var publisher = new Publisher();
				assert.doesNotThrow(function () {
					publisher.off('test', function () {
					});
				});
			});

			it('should simply do nothing, if this callback doesn\'t exists', function () {
				var publisher = new Publisher();
				publisher.on('test', function () {
				});
				assert.doesNotThrow(function () {
					publisher.off('test', function () {
					});
				});
			});

			describe('Hierarchical events', function () {
				it('Hierarchical removing listeners should also work without a callback', function () {
					var publisher = new Publisher();
					var called = {
						top : sinon.spy(),
						tierA : sinon.spy(),
						tierB : sinon.spy(),
						bottom : sinon.spy()
					};

					publisher.on('top', called.top);
					publisher.on('top', 'tierA', called.tierA);
					publisher.on('top', 'tierA', 'tierB', called.tierB);
					publisher.on('top', 'tierA', 'tierB', 'bottom', called.bottom);

					publisher.off('top', 'tierA', 'tierB', 'bottom');

					publisher.emit(['top', 'tierA', 'tierB', 'bottom']);
					assert.calledOnce(called.top);
					assert.calledOnce(called.tierA);
					assert.calledOnce(called.tierB);
					assert.notCalled(called.bottom);

					publisher.emit(['top', 'tierA', 'tierB']);
					assert.calledTwice(called.top);
					assert.calledTwice(called.tierA);
					assert.calledTwice(called.tierB);
					assert.notCalled(called.bottom);

					publisher.emit(['top', 'tierA']);
					assert.calledThrice(called.top);
					assert.calledThrice(called.tierA);
					assert.calledTwice(called.tierB);
					assert.notCalled(called.bottom);

					publisher.emit('top');
					assert.callCount(called.top, 4);
					assert.calledThrice(called.tierA);
					assert.calledTwice(called.tierB);
					assert.notCalled(called.bottom);
				});

				it('Hierarchical removing listeners should also work with a callback', function () {
					var publisher = new Publisher();
					var called = {
						top : sinon.spy(),
						tierA : sinon.spy(),
						tierB : sinon.spy(),
						bottom : sinon.spy()
					};
					publisher.on('top', called.top);
					publisher.on('top', 'tierA', called.tierA);
					publisher.on('top', 'tierA', 'tierB', called.tierB);

					publisher.on('top', 'tierA', 'tierB', 'bottom', called.tierB);
					publisher.off('top', 'tierA', 'tierB', 'bottom', called.tierB);

					publisher.emit(['top', 'tierA', 'tierB', 'bottom']);
					assert.calledOnce(called.top);
					assert.calledOnce(called.tierA);
					assert.calledOnce(called.tierB);
					assert.notCalled(called.bottom);

					publisher.emit(['top', 'tierA', 'tierB']);
					assert.calledTwice(called.top);
					assert.calledTwice(called.tierA);
					assert.calledTwice(called.tierB);
					assert.notCalled(called.bottom);

					publisher.emit(['top', 'tierA']);
					assert.calledThrice(called.top);
					assert.calledThrice(called.tierA);
					assert.calledTwice(called.tierB);
					assert.notCalled(called.bottom);

					publisher.emit('top');
					assert.callCount(called.top, 4);
					assert.calledThrice(called.tierA);
					assert.calledTwice(called.tierB);
					assert.notCalled(called.bottom);

				});
			});

			it('should deliver back the publisher for function chaining', function () {
				var publisher = new Publisher();
				assert.equal(publisher.off("Test", function () {
				}), publisher);
			});

			it('the event is unregistered after an on', function () {

				var publisher = new Publisher();
				function TestingMock() {
				}

				publisher.on('test', TestingMock);
				assert.equal(publisher.getListener().next.test.callbacks[0].callback, TestingMock);
				publisher.off('test', TestingMock);
				assert.lengthOf(publisher.getListener().next.test.callbacks, 0);
			});

			it('the event is unregistered after an once', function () {

				var publisher = new Publisher();
				var testing = sinon.spy();

				publisher.once('test', testing);
				publisher.off('test', testing);
				publisher.emit('test');
				assert.notCalled(testing);

			});

			it('off unregister all callbacks if no one is prohibited', function () {
				var publisher = new Publisher();
				function TestingMock() {
				}

				publisher.on('test', TestingMock);
				assert.equal(publisher.getListener().next.test.callbacks[0].callback, TestingMock);
				publisher.off('test');
				assert.lengthOf(publisher.getListener().next.test.callbacks, 0);
			});

			it('off without parameter deletes all', function () {
				var publisher = new Publisher();
				function TestingMock() {
				}

				publisher.on('test1', TestingMock);
				publisher.on('test2', TestingMock);
				publisher.on('test3', TestingMock);


				publisher.off();
				assert.lengthOf(Object.keys(publisher.getListener().callbacks), 0);
				assert.lengthOf(Object.keys(publisher.getListener().next), 0);
			});
		});

		describe('#emit', function () {

			it('should deliver back the publisher for function chaining', function () {
				var publisher = new Publisher();
				assert.equal(publisher.emit("Test"), publisher);
			});

			it('if a publishion to a subscriber fails the publisher should continue with the next sub', function () {
				var publisher = new Publisher();

				var forcingError = sinon.stub().throws();
				var shouldRunFine = sinon.spy();

				publisher.on("callMe", forcingError);
				publisher.on("callMe", shouldRunFine);
				assert.doesNotThrow(function () {
					publisher.emit("callMe");
				});

				assert.calledOnce(shouldRunFine);
			});
		});
	});

	describe('coexisting should not influence each other', function () {
		it('two publisher with 1 event each', function () {

			function TestingMockA() {
			}
			var publisherA = new Publisher();
			publisherA.on('test', TestingMockA);
			var subsA = publisherA.getListener().next;
			assert.deepEqual(Object.keys(subsA), ['test']);
			assert.equal(subsA.test.callbacks[0].callback, TestingMockA);

			function TestingMockB() {
			}
			var publisherB = new Publisher();
			publisherB.on('test', TestingMockB);
			var subsB = publisherB.getListener().next;
			assert.deepEqual(Object.keys(subsB), ['test']);
			assert.equal(subsB.test.callbacks[0].callback, TestingMockB);

			assert.deepEqual(Object.keys(subsA), ['test']);
			assert.lengthOf(subsA.test.callbacks, 1);
			assert.equal(subsA.test.callbacks[0].callback, TestingMockA);
		});
	});
});