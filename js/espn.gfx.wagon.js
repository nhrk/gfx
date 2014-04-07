'use strict';

d3.chart('wagon', {

	config: {
		colors: ['#7dcc5f', '#f88f22', '#fff'],
		diameter: 150,
		padding: 0,
		textPadding: 35,
		labelAttr: {
			'fill': '#000',
			'font-size': '12px'
		},
		maxLabelColor: '#fff',
		shadeColor: '#fff',
		gradientDefId: 'mcr-chart-wagon-gradient',
		gradientColors: ['#7dcc5f', '#74c24c'],
		arcClass: 'mcr-chart-wagon-arc',
		count: 0
	},

	initialize: function(options) {

		options = options || {};

		var chart = this,
			diameter = options.diameter || chart.config.diameter,
			radius = diameter / 2,
			padding = options.padding || chart.config.padding,
			textPadding = options.textPadding || chart.config.textPadding,
			labelAttr = options.labelAttr || chart.config.labelAttr,
			maxLabelColor = options.maxLabelColor || chart.config.maxLabelColor,
			gradientColors = options.gradientColors || chart.config.gradientColors,
			shade = options.shade,
			filterZone,
			colors = (options.colors && options.colors.length == 3) ? options.colors : chart.config.colors,
			wrapper,
			arc,
			pie,
			onMouseover = options.onMouseover,
			onMouseout = options.onMouseout,
			gradient;

		if (options.type === 'filter') {
			this.filterZone = true;
		}

		arc = d3.svg.arc()
			.outerRadius(radius - padding)
			.innerRadius(0);

		pie = d3.layout.pie()
			.sort(null)
			.value(function(d) {
				return 1;
			});

		this.base = this.base.append('svg');

		this.width(diameter);

		this.height(diameter);

		wrapper = this.base.append('g')
			.attr('transform', 'translate(' + diameter / 2 + ',' + diameter / 2 + ')');

		chart.config.count++;

		this._gradientId = chart.config.gradientDefId + '-' + chart.config.count;

		gradient = this.base.append('defs')
			.append('radialGradient')
			.attr('id', chart._gradientId)
			.attr('r', '65%');

		gradient.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', chart.config.gradientColors[0])
			.attr('stop-opacity', '1');

		gradient.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', chart.config.gradientColors[1])
			.attr('stop-opacity', '1');

		if (shade) {
			this.base.append('circle')
				.attr('cx', diameter / 2)
				.attr('cy', diameter / 2)
				.attr('r', (radius - textPadding / 1.5))
				.attr('fill', chart.config.shadeColor)
				.attr('opacity', 0.2);
		}

		function onEnter() {
			this.append('path')
				.attr('d', arc)
				.style('stroke', colors[2])
				.style('fill', function(d, i) {
					return d.data.max ? colors[1] : 'url(#' + chart._gradientId + ')';
				}).on('mouseover', function(d, i) {
					if (typeof onMouseover === 'function') {
						var bbox = this.getBBox();
						onMouseover(chart.base.node(), d, bbox);
					}
				}).on('mouseout', function(d, i) {
					if (typeof onMouseout === 'function') {
						var bbox = this.getBBox();
						onMouseout(chart.base.node(), d, bbox);
					}
				});

			if (chart.filterZone) {
				this.on('click', filterZone.toggle);
			}

			this.append('text')
				.attr('transform', function(d) {
					var c = arc.centroid(d),
						x = c[0],
						y = c[1],
						h = Math.sqrt(x * x + y * y);
					return 'translate(' + (x / h * (radius - textPadding)) + ',' + (y / h * (radius - textPadding)) + ')';
				})
				.attr('dy', '.35em')
				.style('text-anchor', 'middle')
				.attr(labelAttr)
				.attr('fill', function(d, i) {
					// override fill color for the max zone
					return (d.data.max) ? maxLabelColor : labelAttr.fill;
				})
				.text(function(d) {
					return (chart.filterZone) ? '' : d.data.runs;
				});
		}

		if (chart.filterZone) {

			filterZone = {
				toggle: function(d) {

					d = d || [];

					d = (Object.prototype.toString.call(d) == '[object Array]') ? d : [d.data.zone];

					chart.selectedZones = chart.selectedZones || {};

					for (var i = d.length - 1; i >= 0; i--) {
						if (!chart.selectedZones[d[i]]) {
							chart.selectedZones[d[i]] = true;
						} else {
							chart.selectedZones[d[i]] = false;
						}
					}

					wrapper.selectAll('.' + chart.config.arcClass + ' path')
						.each(function(d, i) {
							d3.select(this).style('fill', function() {
								return (chart.selectedZones[d.data.zone]) ? colors[1] : 'url(#' + chart._gradientId + ')';
							});
						});

					console.log('zones :', getSelectedZones());
					return getSelectedZones();
				},
				all: function() {
					chart.selectedZones = {
						"1": 1,
						"2": 1,
						"3": 1,
						"4": 1,
						"5": 1,
						"6": 1,
						"7": 1,
						"8": 1
					};
					return filterZone.toggle();
				},
				none: function() {
					chart.selectedZones = {};
					return filterZone.toggle();
				}
			}

			// Make this api public
			this.filterZone = filterZone;
		}

		function getSelectedZones() {
			var arr = [];
			for (var z in chart.selectedZones) {
				if ( !! chart.selectedZones[z]) {
					arr.push(z);
				}
			}
			return arr;
		}

		function onTrans() {
			this.each(function(d, i) {
				var g = d3.select(this);
				g.select('text')
					.text(function() {
						return (chart.filterZone) ? '' : d.data.runs;
					})
					.attr('fill', function(d, i) {
						// override fill color
						return (d.data.max) ? maxLabelColor : labelAttr.fill;
					});
				g.select('path')
					.style('fill', function(d, i) {
						return d.data.max ? colors[1] : 'url(#' + chart._gradientId + ')';
					});
			});
		}

		function dataBind(data) {
			return wrapper.selectAll('.' + chart.config.arcClass)
				.data(pie(data));
		}

		function insert() {
			return this.append('g').attr('class', chart.config.arcClass);
		}

		var wagon = this.layer('wagon', wrapper, {
			dataBind: dataBind,
			insert: insert
		});

		wagon.on('enter', onEnter);
		wagon.on('update:transition', onTrans);

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
		if (this.filterZone) {
			return this.getObject();
		}
		return dataSrc;
	},

	getObject: function() {
		// returns a dummy object to create a zone filter
		var arr = [];
		for (var i = 1; i <= 8; i++) {
			arr.push({
				runs: 1,
				zone: i
			})
		}
		return arr;
	}
});