'use strict';

d3.chart('bars', {

	config: {
		barSpacing: 10,
		colors: ['#f9901d', '#7dcc5f', 'orangered'],
		bars1Class: 'bars1',
		bars2Class: 'bars2',
		xAxClass: '',
		yAx2Class: '',
		yAx1Class: '',
		xScaleValue: 'overs',
		bottomMargin: 45,
		leftMargin: 20,
		topMargin: 20,
		rightMargin: 20,
		keySquareSize: 13,
		keySpacing: 55,
		keyLeftMargin: 16,
		keyTextRightMargin: 16,
		keyTextBottomMargin: 11,
		keyClass: 'key',
		wrapperClass: 'wrapperClass',
		xClass: 'x axis',
		y1Class: 'y axis axisLeft',
		y2Class: 'y axis axisRight',
		y1Key: 'runs',
		y2Key: 'balls',
		xKey: 'overs',
		titleAttrs: {
			'font-weight': 'bold',
			'font-size': '1.3em'
		},
		animDuration: 100
	},

	initialize: function(options) {

		options = options || {};

		var chart = this,
			colors = options.colors || chart.config.colors,
			barSpacing = options.barSpacing || chart.config.barSpacing,
			leftMargin = options.leftMargin || chart.config.leftMargin,
			rightMargin = options.rightMargin || chart.config.rightMargin,
			topMargin = options.topMargin || chart.config.topMargin,
			bottomMargin = options.bottomMargin || chart.config.bottomMargin,
			keyLeftMargin = options.keyLeftMargin || chart.config.keyLeftMargin,
			titleAttrs = options.titleAttrs || chart.config.titleAttrs,
			chartTitle = options.chartTitle || null;

		this.dualAxis = options.dualAxis || chart.config.dualAxis;

		this.base = this.base.append('svg');

		this.width(options.width || 400);

		this.height(options.height || 250);

		this.wrapper = this.base.append('g')
			.attr('class', chart.config.wrapperClass)
			.attr('transform', 'translate(0,' + (topMargin) + ')');

		this.wrapper.append('g')
			.attr('class', chart.config.xClass)
			.attr('transform', 'translate(' + (leftMargin / 2) + ',' + (this.height() - bottomMargin - topMargin) + ')');

		this.wrapper.append('g')
			.attr('class', chart.config.y1Class)
			.attr('transform', 'translate(' + leftMargin + ',0)');

		if (this.dualAxis) {
			this.wrapper.append('g')
				.attr('class', chart.config.y2Class)
				.attr('transform', 'translate(' + (this.width() - rightMargin) + ',0)');
		}

		if (chartTitle) {
			chartTitle = this.wrapper.append('text')
				.text(chartTitle)
				.attr(titleAttrs)
				.attr('dx', 0)
				.attr('dy', 0);

			var bbox = chartTitle[0][0].getBBox();

			chartTitle.attr('dx', (chart.width() / 2) - (bbox.width / 2))
				.attr('dy', chart.height() - (bbox.height * 2));
		}

		this.x = d3.scale.ordinal()
			.rangeRoundBands([leftMargin / 2, this.width() - rightMargin], .1);

		this.y1 = d3.scale.linear()
			.range([this.height() - bottomMargin - topMargin, 0]);

		this.y2 = d3.scale.linear()
			.range([this.height() - bottomMargin - topMargin, 0]);

		this.xAxis = d3.svg.axis()
			.scale(this.x)
			.orient('bottom');

		this.yAxisLeft = d3.svg.axis()
			.scale(this.y1)
			.ticks(4)
			.tickSize(-chart.width() + leftMargin + (chart.dualAxis ? rightMargin : 0))
			.orient('left');

		this.yAxisRight = d3.svg.axis()
			.scale(this.y2)
			.ticks(4)
			.tickSize(-chart.width() + rightMargin + leftMargin)
			.orient('right');

		/* 1st Y axis */

		var bars1 = this.layer(chart.config.bars1Class, this.wrapper.append('g').attr('class', chart.config.bars1Class).attr('transform', 'translate(' + leftMargin / 2 + ',0)'), {
			dataBind: function(data) {
				return this.selectAll('.' + chart.config.bars1Class + ' rect').data(data, function(d, i) {
					return data.indexOf(d);
					/*return d[chart.config.xKey];*/
				});
			},
			insert: insert
		});

		function insert() {
			return this.insert('rect');
		}

		bars1.on('enter', function() {

			this.attr('x', function(d) {
				return chart.x(d[chart.config.xKey]);
			})
				.attr('width', function() {
					return (chart.dualAxis) ? chart.x.rangeBand() / 2 - barSpacing : (chart.width() - leftMargin - rightMargin) / chart.length - barSpacing;
				})
				.attr('fill', function(d, i) {
					return d.powerplay ? colors[1] : colors[0];
				})
				.attr('y', function(d) {
					return chart.y1(d[chart.config.y1Key]);
				})
				.attr('height', function(d, i, j) {
					return chart.height() - bottomMargin - chart.y1(d[chart.config.y1Key]) - topMargin;
				});
		});

		bars1.on('update:transition', function() {

			this.attr('height', function(d, i, j) {
				return chart.height() - bottomMargin - chart.y1(d[chart.config.y1Key]) - topMargin;
			})
				.attr('width', function() {
					return (chart.dualAxis) ? chart.x.rangeBand() / 2 - barSpacing : (chart.width() - leftMargin - rightMargin) / chart.length - barSpacing;
				})
				.attr('fill', function(d, i) {
					return d.powerplay ? colors[1] : colors[0];
				})
				.attr('y', function(d) {
					return chart.y1(d[chart.config.y1Key]);
				})
		});

		bars1.on('exit:transition', onExit);

		function onExit() {
			this.duration(chart.config.animDuration)
				.attr('width', 0)
				.remove();
		}

		if (chart.dualAxis) {

			/* 2nd Y axis */

			var bars2 = this.layer(chart.config.bars2Class, this.wrapper.append('g').attr('class', chart.config.bars2Class).attr('transform', 'translate(' + leftMargin / 2 + ',0)'), {
				dataBind: function(data) {
					return this.selectAll('.' + chart.config.bars2Class + ' rect').data(data, function(d, i) {
						return d[chart.config.xKey];
					});
				},
				insert: insert
			});

			bars2.on('enter', function() {

				this.attr('x', function(d) {
					return chart.x(d[chart.config.xKey]) + chart.x.rangeBand() / 2;
				})
					.attr('width', chart.x.rangeBand() / 2 - barSpacing)
					.attr('fill', function() {
						return colors[1];
					})
					.attr('y', function(d) {
						return chart.y2(d[chart.config.y2Key]);
					})
					.attr('height', function(d, i, j) {
						return chart.height() - bottomMargin - chart.y2(d[chart.config.y2Key]) - topMargin;
					});
			});

			bars2.on('update:transition', function() {

				this.attr('height', function(d, i, j) {
					return chart.height() - bottomMargin - chart.y2(d[chart.config.y2Key]) - topMargin;
				})
					.attr('y', function(d) {
						return chart.y2(d[chart.config.y2Key]);
					})
			});

			bars2.on('exit:transition', onExit);
		}

		/* TODO: Use as a mixin, Key is same as stacked chart */

		if (options.key && options.key.length) {

			this.layer('key', this.base.append('g').attr('class', chart.config.keyClass), {

				dataBind: function(data) {
					return this.selectAll('rect')
						.data(options.key);
				},

				insert: function() {
					return this.append('rect');
				},

				events: {
					enter: function() {
						this.attr('x', function(d, i) {
							return (chart.config.keySpacing * i) + (keyLeftMargin);
						})
							.attr('y', chart.config.keyYPos)
							.attr('height', chart.config.keySquareSize)
							.attr('width', chart.config.keySquareSize)
							.style('fill', function(d, i) {
								return colors[i];
							}).each(function(d, i) {
								chart.base.select('.' + chart.config.keyClass).append('text')
									.attr('dx', function() {
										return (chart.config.keySpacing * i) + (keyLeftMargin + chart.config.keyTextRightMargin);
									})
									.attr('dy', function() {
										return chart.config.keyTextBottomMargin;
									})
									.text(function() {
										return d;
									});
							});
					}
				}
			});
		}

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

		var chart = this;

		this.length = dataSrc.length;

		// TODO: Update - Right now restricted to top 5 (spells) for dual axis
		if (this.dualAxis && dataSrc.length > 5) {
			dataSrc = dataSrc.slice(0, 5);
		}
		this.x.domain(dataSrc.map(function(d) {
			return d[chart.config.xKey];
		}));
		this.y1.domain([0, d3.max(dataSrc, function(d) {
			return d[chart.config.y1Key];
		})]);
		if (this.dualAxis) {
			this.y2.domain([0, d3.max(dataSrc, function(d) {
				return d[chart.config.y2Key];
			})]);
		}

		/* Added custom function */
		this.onTransform(dataSrc);
		return dataSrc;
	},

	onTransform: function(dataSrc) {

		// TODO: set tick frequency based on data length

		this.xAxis.ticks(5);

		if (this.dualAxis) {
			this.wrapper.select('.y.axisRight')
				.call(this.yAxisRight);
		}

		this.wrapper.select('.x.axis')
			.call(this.xAxis);

		this.wrapper.select('.y.axisLeft')
			.call(this.yAxisLeft);
	}

});