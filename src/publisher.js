/**
 * extends an existing object with Publisher functionality or creates a new instance
 * @param {object} objectToExtend
 * @returns {Publisher}
 */
module.exports = function Publisher(objectToExtend) {

	//we can either extend an existing object or be a new instance
	var self = objectToExtend || this;

	//the root level of listeners
	var listener = createListenerLevel();


	/**
	 * returns the listener tree
	 * @returns {object}
	 */
	self.getListener = function () {
		return listener;
	};


	/**
	 * adds a new listener
	 * @params {string} eventChain as many times as the user which to define the event chain
	 * @params {function} callback
	 * @returns {Publisher}
	 */
	self.on = function () {

		//get and check last argument, which should be a function
		var callback = Array.prototype.pop.call(arguments);
		if (typeof callback !== 'function') {
			throw new Error('illegal argument. .on expects last argument to be an function');
		}

		var events = Array.prototype.slice.call(arguments);

		//find the correct position in the tree and add the listener

		addListener(getCorrectPositionInListenerTree(listener, events).callbacks, callback, false);

		return self;
	};


	/**
	 * removes a specific or all listener from the event tree
	 * @params {string} eventChain as many times as the user which to define the event chain
	 * @params {function} optional callback
	 * @returns {Publisher}
	 */
	self.off = function () {

		if (!arguments.length) {
			listener = createListenerLevel();
			return self;
		}

		//is a callback to be removed specified?
		if (typeof arguments[arguments.length - 1] === 'function') {
			var callbackToRemove = Array.prototype.pop.call(arguments);
		}

		//find the correct position in the tree for the removement
		var positionInTree = getCorrectPositionInListenerTree(listener, Array.prototype.slice.call(arguments));

		//is a callback specified?
		if (callbackToRemove) {

			//find it and remove it
			positionInTree.callbacks = positionInTree.callbacks.filter(function (elem) {
				return elem.callback !== callbackToRemove;
			});

		} else {

			//remove all callbacks. Believe it or not, this is by far the most performant way
			while (positionInTree.callbacks.length) {
				positionInTree.callbacks.pop();
			}
		}

		//@todo: potential cleanup in listener object to keep the tree as small as possible and the emit as fast as possible

		return self;
	};


	/**
	 * execute a callback exactly one time and not more
	 * @returns {undefined}
	 */
	self.once = function () {

		//get and check last argument, which should be a function
		var callback = Array.prototype.pop.call(arguments);
		if (typeof callback !== 'function') {
			throw new Error('illegal argument. .on expects last argument to be an function');
		}

		var events = Array.prototype.slice.call(arguments);

		//find the correct position in the tree and add the listener

		addListener(getCorrectPositionInListenerTree(listener, events).callbacks, callback, true);

		return self;

	};


	/**
	 * emit data to a given eventchain
	 * @param {array/string} emitTo
	 * @param {mixed} data that should be parsed to the callback
	 * @returns {Publisher}
	 */
	self.emit = function (emitTo) {

		//get all elements from arguments exept the first one)
		var data = Array.prototype.slice.call(arguments, 1);
		var placeAt = listener;

		//allow publishing to strings, but convert them now
		if (typeof emitTo === 'string') {
			emitTo = [emitTo];
		}

		//iterate from general to specific level to trigger all callbacks
		var i = 0;
		do {
			placeAt.callbacks.forEach(function (item, index, arr) {

				try {
					item.callback.apply(self, data);
				} catch (e) {
					//todo: what to do, if customers code throws an error, beside calling the other listeners?
				}
				if (item.once) {
					arr.splice(index, 1);
				}
			});

		} while ((placeAt = placeAt.next[emitTo[i++]]));

		return self;
	};


	return self;
};


/**
 * adds a listener to a a given level in the callback tree
 * @param {object} callbacks
 * @param {function} callback
 * @param {boolean} once
 * @returns {undefined}
 */
function addListener(callbacks, callback, once) {
	once = once || false;
	callbacks.push({callback : callback, once : once});
}


/**
 * creates a listener level
 * @returns {createListenerLevel.publisherAnonym$0}	 
 * */
function createListenerLevel() {
	return {
		next : {},
		callbacks : []
	};
}


/**
 * finds and return the currect position in the listener object according to the event chain
 * @param {type} listener
 * @param {type} eventChain
 * @returns {listener.next}
 * */
function getCorrectPositionInListenerTree(listener, eventChain) {

	eventChain.forEach(function (nextElem) {

		if (!listener.next[nextElem]) {
			listener.next[nextElem] = createListenerLevel();
		}

		listener = listener.next[nextElem];
	});

	return listener;
}