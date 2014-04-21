centre.card('batting', {
	id: 'battingCard',
	frequency: 5000,
	endpoint: './stub.json',
	initialize: function(card) {
		var $el = card.getElem(),
			url = card.getUrl();
		// console.log('initialize', card.name, card, url, $el);
	},
	success: function(data, card) {
		console.log(data, 'success', card.name);
		card.updateCard(data);
	},
	extend: {
		search: function() {
			return 'search for ' + this.name;
		},
		updateCard: function(data) {
			var $el = this.getElem();
			$el.append('<br>Url: ' + this.getUrl() + ' - api: ' + data.api + ' ' + this.name);
		}
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
			// console.log(card);
			card.startPolling();
		}
	}, {
		selector: 'input[name=addparams]',
		type: 'click',
		fn: function(e, card) {
			// console.log('addparam', card);
			card.poll({
				params: '?a=1'
			});
		}
	}, {
		selector: 'input[name=removeparams]',
		type: 'click',
		fn: function(e, card) {
			// console.log('removeparams', this);
			card.poll({
				params: null
			});
		}
	}, {
		selector: 'input[name=getelem]',
		type: 'click',
		fn: function(e, card) {
			// console.log('getelem', card.getElem());
		}
	}, {
		selector: 'input[name=clear]',
		type: 'click',
		fn: function(e, card) {
			// console.log('clear', this, card);
			card.clear();
		}
	}, {
		selector: 'input[name=frequency]',
		type: 'click',
		fn: function(e, card) {
			card.setFrequency(3000);
			// console.log('frequency', this, card);
		}
	}]
});