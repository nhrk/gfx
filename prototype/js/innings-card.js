centre.card('innings', {
	id: 'inningsCard',
	initialize: function(card) {
		console.log('initialize', card.name, card);
	},
	success: function(data, card) {
		console.log(data, 'success');
	},
	events: []
});