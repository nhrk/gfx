'use strict';

d3.chart('spikes', {

	config: {
		diameter: 150,
		maxLabelColor: '#fff',
		shadeColor: '#fff',
		gradientDefId: 'radialGradient',
		gradientColors: ['#7dcc5f', '#7ac85b'],
		colorMap: {
			'1': '#8a17a7',
			'2': '#642c01',
			'3': '#f0d900',
			'4': '#e0e0e0',
			'5': '#034466',
			'6': '#fa280c'
		},
		offset: 17,
		strokeWidth: 2,
		spikesClass: 'spikesClass',
		pitch: {
			width: 22,
			height: 52,
			radius: 3,
			fill: '#ffcb92'
		},
		ring: {
			width: 95,
			height: 125,
			radius: 45,
			fill: '#fff',
			opacity: 0.15
		},
		ground: {
			stroke: '#fef4b7'
		},
		strikerPos: {
			fill: '#fff',
			radius: 3,
			stroke: '#000'
		}
	},

	initialize: function(options) {

		var chart = this,
			diameter = options.diameter || chart.config.diameter,
			radius = diameter / 2,
			gradientColors = options.gradientColors || chart.config.gradientColors,
			shade = options.shade,
			offset = options.offset || chart.config.offset,
			colorMap = options.colorMap || chart.config.colorMap,
			wrapper,
			center,
			gradient;

		this.base = this.base.append('svg');

		this.width(diameter);

		this.height(diameter);

		center = diameter / 2;

		this.base.append('circle')
			.attr('cx', center)
			.attr('cy', center)
			.attr('r', radius)
			.attr('stroke-width', '5')
			.attr('stroke', chart.config.ground.stroke)
			.attr('fill', 'url(#' + chart.config.gradientDefId + ')');

		// Append Pitch
		this.base.append('rect')
			.attr('x', center - chart.config.pitch.width / 2)
			.attr('rx', chart.config.pitch.radius)
			.attr('y', center - chart.config.pitch.height / 2)
			.attr('ry', chart.config.pitch.radius)
			.attr('width', chart.config.pitch.width)
			.attr('height', chart.config.pitch.height)
			.attr('fill', chart.config.pitch.fill);

		// Append 30 yards circle
		this.base.append('rect')
			.attr('x', center - chart.config.ring.width / 2)
			.attr('rx', chart.config.ring.radius)
			.attr('y', center - chart.config.ring.height / 2)
			.attr('ry', chart.config.ring.radius)
			.attr('width', chart.config.ring.width)
			.attr('height', chart.config.ring.height)
			.attr('opacity', chart.config.ring.opacity)
			.attr('fill', chart.config.ring.fill);

		wrapper = this.base.append('g');

		// Gradient
		gradient = this.base.append('defs')
			.append('radialGradient')
			.attr('id', chart.config.gradientDefId)
			.attr('r', '65%');

		gradient.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', chart.config.gradientColors[0])
			.attr('stop-opacity', '1');

		gradient.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', chart.config.gradientColors[1])
			.attr('stop-opacity', '1');

		// Striker Position marker	
		this.base.append('circle')
			.attr('cx', diameter / 2)
			.attr('cy', diameter / 2 - offset)
			.attr('r', chart.config.strikerPos.radius)
			.attr('stroke', chart.config.strikerPos.stroke)
			.attr('fill', chart.config.strikerPos.fill);

		function onEnter() {

			this.attr('d', function(d, i) {
				return 'M' + center + ',' + (center - offset) + 'L' + d.x + ',' + d.y;
			})
				.attr('stroke', function(d, i) {
					return colorMap[d.runs] || '#fff';
				})
				.attr('stroke-width', chart.config.strokeWidth)
				.on('mouseover', function(d, i) {
					var bbox = this.getBBox();
					console.log('comms:', d.comms, 'x:', bbox.x, 'y:', bbox.y, 'runs:', d.runs);
				});
		}

		function onTrans() {

			this.attr('d', function(d, i) {
				return 'M' + center + ',' + (center - offset) + 'L' + d.x + ',' + d.y;
			})
				.attr('stroke', function(d, i) {
					return colorMap[d.runs] || '#fff';
				});
		}

		function dataBind(data) {
			return wrapper.selectAll('.' + chart.config.spikesClass)
				.data(data);
		}

		function insert() {
			return this.append('path').attr('class', chart.config.spikesClass);
		}

		var spikes = this.layer('spikes', wrapper, {
			dataBind: dataBind,
			insert: insert
		});

		spikes.on('enter', onEnter);
		spikes.on('update:transition', onTrans);

	},

	width: function(newWidth) {
		if (!arguments.length) {
			return this._width;
		}
		this._width = newWidth;
		this.base.attr('width', this._width);
		return this;
	},

	height: function(newHeight) {
		if (!arguments.length) {
			return this._height;
		}
		this._height = newHeight;
		this.base.attr('height', this._height);
		return this;
	},

	transform: function(dataSrc) {
		return dataSrc;
	}
});