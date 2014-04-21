"use strict";

var centre = (function($) {

	var config = {
		frequency: 3000,
		// Switch for logging?
		debug: true
	},
		_timers = {},
		_cards = {},
		api;

	// @constructor
	function Card(name, options) {

		var card = this;

		options = options || {};

		if (!(card instanceof Card)) {
			return new Card(name, options);
		}

		this.name = name;

		this.id = options.id || name;

		if (options.endpoint) {

			this.endpoint = /*( get environUrl with helper ) + */ options.endpoint;

			this.frequency = options.frequency || config.frequency;

			this.error = options.error || onError;
		}

		this.success = options.success;

		if (typeof options.initialize === 'function') {
			// Callback initialize
			this.initialize = options.initialize;
		}

		// Cache cards and event declarations
		_cards[this.name] = {
			events: options.events,
			self: this,
			extend: options.extend
		};

		// TODO: Stricter type checks
		if (options.extend) {
			extend(card, options.extend);
		}

		if (options.events && options.events.length) {
			// Add events if dom ready
			if ($.isReady) {
				addEvents(options.events, this);
				this.inited = true;
			}
		}

		if ( !! this.endpoint && typeof this.success === 'function') {
			this.poll();
		} else {
			this.trigger = function(data) {
				card.success(data, card);
			}
		}

		return this;
	}

	Card.prototype.setFrequency = function(frequency) {
		if (!isNaN(Number(frequency))) {
			this.frequency = Number(frequency);
		}
	}

	Card.prototype.getFrequency = function() {
		return this.frequency;
	}

	Card.prototype.stopPolling = function() {
		window.clearTimeout(_timers[this.name]);
		_timers[this.name] = null;
	}

	Card.prototype.startPolling = function(options) {
		options = options || {};
		var card = this;

		// Stop existing polling
		card.stopPolling();

		card.setFrequency(options.frequency);

		// Begin polling
		_timers[this.name] = window.setTimeout(function() {
			card.poll(options);
		}, card.frequency);
	}

	Card.prototype.poll = function(options) {

		options = options || {};

		var card = this,
			params = options.params,
			settings = {
				complete: function() {
					log('complete');
					card.startPolling();
				},
				success: function(data) {
					card.success(data, card);
				},
				error: card.error
			};

		// If params are passed or params need to cleared
		if (params || params === null) {
			this.params = params;
		}

		settings.url = this.endpoint + (this.params ? this.params : '');

		// Kick start polling (requires jQuery)
		return $.ajax(settings);
	};

	Card.prototype.getElem = function() {
		return this.elem;
	}

	Card.prototype.getUrl = function() {
		return this.endpoint + (this.params ? this.params : '');
	}

	Card.prototype.extends = function(cardName) {
		extend(this, _cards[cardName].extend);
	}

	Card.prototype.clear = function() {
		var name = this.name,
			card = _cards[name];
		// TODO: More typechecks
		if (name && card) {
			this.stopPolling();
			removeEvents(card.events, card.self);
			return true;
		}
	};

	// Simple Mixin
	function extend(obj, extensions) {
		for (var prop in extensions) {
			if (extensions.hasOwnProperty(prop)) {
				obj[prop] = extensions[prop];
			}
		}
	}

	function beforeEvents(card) {
		card.elem = $(card && card.id ? '#' + card.id : '');
	}

	function afterEvents(card) {
		initialize(card);
	}

	function initialize(card) {
		if (!card.inited && typeof card.initialize === 'function') {
			card.initialize(card);
			card.inited = true;
			delete card.initialize;
		}
	}

	function addEvents(events, card) {
		handleEvents(events, card);
	}

	function removeEvents(events, card) {
		handleEvents(events, card, true);
	}

	function handleEvents(events, card, remove) {
		var ev, selector, handler, type;

		for (var i = 0; i < (events && events.length); i++) {
			ev = events[i];
			selector = ev.selector;
			handler = ev.fn;
			type = ev.type;
			// Closure to access the handler fn after the loop is completed
			(function(handler) {
				// Add event handler with jQuery, set all events in context with card ids
				selector = card.elem.find(ev.selector);

				( !! remove) ? selector.off(type, eventHandler) : selector.on(type, eventHandler);

				function eventHandler(e) {
					handler.call(this, e, card);
				}

			}(handler));
		}
	}

	function onload() {
		// Do card init
		var card;
		for (var c in _cards) {
			card = _cards[c];
			beforeEvents(card.self);
			addEvents(card.events, card.self);
			afterEvents(card.self);
		}
	}

	function onunload() {
		// TODO: cleanups
		// empty cache
		_cards = _timers = null;
	}

	function onError(e) {
		log('Error: ', e);
	}

	function log(str) {
		if (config.debug) {
			console.log(str);
		}
	}

	api = {
		version: '0.0.1',
		init: function() {

		},
		card: function(name, options) {
			if ( !! _cards[name]) {
				log('Error: Can\'t init, card with the same name exists already');
			} else {
				return (new Card(name, options));
			}
		},
		getCard: function(name) {
			return _cards[name].self;
		}
	};

	$(document).ready(onload);
	// Do we need to unload anything?
	$(window).unload(onunload);

	return api;

}(jQuery));