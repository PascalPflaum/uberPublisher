var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var dummy = function () {};

var Publisher = require('../src/publisher.js');
var uber = new Publisher();
uber.on('channel', dummy);

var EventEmitter = require('events');
var myEmitter = new EventEmitter();
myEmitter.on('channel', dummy);

var pubSubJS = require('pubsub-js');
pubSubJS.subscribe('channel', dummy);

var Eventemitter2 = require('eventemitter2');
var eventemitter2 = new Eventemitter2({
	wildcard : true
});
eventemitter2.on('channel', dummy);

// add tests
suite.
		add('uberPublisher', function () {
			uber.emit('channel', 'data', 123);
		})
		.add('vanilla node', function () {
			myEmitter.emit('channel', 'data', 123);
		})
		.add('pubSubJS', function () {
			pubSubJS.publish('channel', 'data', 123);
		})
		.add('eventemitter2', function () {
			eventemitter2.emit('channel', 'data', 123);
		})
// add listeners
		.on('cycle', function (event) {
			console.log(String(event.target));
		})
		.on('complete', function () {
			console.log('Fastest is ' + this.filter('fastest').map('name'));
		})
// run async
		.run({'async' : true});