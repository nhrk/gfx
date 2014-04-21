centre.card('bowling', {
	id: 'bowlingCard',
	frequency: 5000,
	endpoint: './stub.json?card=bowling',
	initialize: function(card) {
		console.log('initialize', card.name);
	},
	success: function(data, card) {
		console.log(data, 'success', card.name);
		card.updateCard(data);
	},
	events: [{
		selector: 'input[name=stop]',
		type: 'click',
		fn: function(e, card) {
			// console.log('stop');
			card.stopPolling();
		}
	}, {
		selector: 'input[name=start]',
		type: 'click',
		fn: function(e, card) {
			// console.log('start');
			card.startPolling();
		}
	}]
}).extends('batting');