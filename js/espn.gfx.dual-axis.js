'use strict';

d3.chart('dual-axis', {

	config: {
		barSpacing: 10,
		colors: ['#f9901d', '#7dcc5f'],
		runsClass: 'bars1',
		ballsClass: 'bars2',
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
		xKey: 'spell',
		titleAttrs: {
			'font-weight': 'bold',
			'font-size': '1.3em'
		}
	},

	initialize: function(options) {

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

		this.wrapper.append('g')
			.attr('class', chart.config.y2Class)
			.attr('transform', 'translate(' + (this.width() - rightMargin) + ',0)');

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

		this.y_1 = d3.scale.linear()
			.range([this.height() - bottomMargin - topMargin, 0]);

		this.y_2 = d3.scale.linear()
			.range([this.height() - bottomMargin - topMargin, 0]);

		this.xAxis = d3.svg.axis()
			.scale(this.x)
			.orient('bottom');

		this.yAxisLeft = d3.svg.axis()
			.scale(this.y_1)
			.ticks(4)
			.tickSize(-chart.width() + rightMargin + leftMargin)
			.orient('left');

		this.yAxisRight = d3.svg.axis()
			.scale(this.y_2)
			.ticks(4)
			.tickSize(-chart.width() + rightMargin + leftMargin)
			.orient('right');

		options = options || {};

		/* 1st Y axis */

		function onEnterY_1() {

			this.attr('x', function(d) {
				return chart.x(d[chart.config.xKey]);
			})
				.attr('width', chart.x.rangeBand() / 2 - barSpacing)
				.attr('style', function() {
					return 'fill:' + colors[0];
				})
				.attr('y', function(d) {
					return chart.y_1(d[chart.config.y1Key]);
				})
				.attr('height', function(d, i, j) {
					return chart.height() - bottomMargin - chart.y_1(d[chart.config.y1Key]) - topMargin;
				});
		}

		function onTransY_1() {
			this.attr('height', function(d, i, j) {
				return chart.height() - bottomMargin - chart.y_1(d[chart.config.y1Key]) - topMargin;
			})
				.attr('y', function(d) {
					return chart.y_1(d[chart.config.y1Key]);
				})
		}

		function dataBindY_1(data) {
			return this.selectAll('.' + chart.config.runsClass + ' rect').data(data, function(d, i) {
				return d[chart.config.xKey];
			});
		}

		function insertY_1() {
			return this.insert('rect');
		}

		var runs = this.layer(chart.config.runsClass, this.wrapper.append('g').attr('class', chart.config.runsClass).attr('transform', 'translate(' + leftMargin / 2 + ',0)'), {
			dataBind: dataBindY_1,
			insert: insertY_1
		});

		runs.on('enter', onEnterY_1);
		runs.on('update:transition', onTransY_1);

		/* 2nd Y axis */

		function onEnterY_2() {
			this.attr('x', function(d) {
				return chart.x(d[chart.config.xKey]) + chart.x.rangeBand() / 2;
			})
				.attr('width', chart.x.rangeBand() / 2 - barSpacing)
				.attr('style', function() {
					return 'fill:' + colors[1];
				})
				.attr('y', function(d) {
					return chart.y_2(d[chart.config.y2Key]);
				})
				.attr('height', function(d, i, j) {
					return chart.height() - bottomMargin - chart.y_2(d[chart.config.y2Key]) - topMargin;
				});
		}

		function onTransY_2() {
			this.attr('height', function(d, i, j) {
				return chart.height() - bottomMargin - chart.y_2(d[chart.config.y2Key]) - topMargin;
			})
				.attr('y', function(d) {
					return chart.y_2(d[chart.config.y2Key]);
				})
		}

		function dataBindY_2(data) {
			return this.selectAll('.' + chart.config.ballsClass + ' rect').data(data, function(d, i) {
				return d[chart.config.xKey];
			});
		}

		function insertY_2() {
			return this.insert('rect');
		}

		var balls = this.layer(chart.config.ballsClass, this.wrapper.append('g').attr('class', chart.config.ballsClass).attr('transform', 'translate(' + leftMargin / 2 + ',0)'), {
			dataBind: dataBindY_2,
			insert: insertY_2
		});

		balls.on('enter', onEnterY_2);
		balls.on('update:transition', onTransY_2);

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

		// Restrict to 5 spells (top 5)
		if (dataSrc.length > 5) {
			dataSrc = dataSrc.slice(0, 5);
		}
		this.x.domain(dataSrc.map(function(d) {
			return d[chart.config.xKey];
		}));
		this.y_1.domain([0, d3.max(dataSrc, function(d) {
			return d[chart.config.y1Key];
		})]);
		this.y_2.domain([0, d3.max(dataSrc, function(d) {
			return d[chart.config.y2Key];
		})]);

		/* Added custom function */
		this.onTransform(dataSrc);
		return dataSrc;
	},

	onTransform: function(dataSrc) {

		var chart = this;

		/* Update x-axis ticks */
		this.xAxis
			.tickFormat(function(d, i) {
				return (dataSrc[i] && dataSrc[i].overs) || '';
			});

		/* Rescale/update axes on data update */
		this.wrapper.select('.x.axis')
			.call(this.xAxis);

		this.wrapper.select('.y.axisLeft')
			.call(this.yAxisLeft);

		this.wrapper.select('.y.axisRight')
			.call(this.yAxisRight);
	}

});