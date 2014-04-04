'use strict';

d3.chart('line', {

	config: {
		colors: ['#f9901d', '#7dcc5f'],
		line1Class: 'mcr-chart-line1',
		line2Class: 'mcr-chart-line2',
		bottomMargin: 45,
		leftMargin: 20,
		topMargin: 20,
		rightMargin: 20,
		keySquareSize: 13,
		keySpacing: 55,
		keyLeftMargin: 16,
		keyTextRightMargin: 16,
		keyTextBottomMargin: 11,
		keyClass: 'mcr-chart-key',
		wrapperClass: 'mcr-chart-line-wrapper',
		xClass: 'mcr-chart-x mcr-chart-axis',
		y1Class: 'mcr-chart-y mcr-chart-axis mcr-chart-axisLeft',
		y2Class: 'mcr-chart-y mcr-chart-axis mcr-chart-axisRight',
		y1Key: 'runs',
		y2Key: 'rate',
		xKey: 'over',
		minTickSpacing: 20,
		maxTicks: 10,
		lineInterpolation: 'monotone',
		strokeWidth: 2,
		titleAttrs: {
			'font-weight': 'bold',
			'font-size': '1.3em'
		}
	},

	initialize: function(options) {

		options = options || {};

		var chart = this,
			colors = options.colors || chart.config.colors,
			leftMargin = options.leftMargin || chart.config.leftMargin,
			rightMargin = options.rightMargin || chart.config.rightMargin,
			topMargin = options.topMargin || chart.config.topMargin,
			bottomMargin = options.bottomMargin || chart.config.bottomMargin,
			keyLeftMargin = options.keyLeftMargin || chart.config.keyLeftMargin,
			lineInterpolation = options.lineInterpolation || chart.config.lineInterpolation,
			titleAttrs = options.titleAttrs || chart.config.titleAttrs,
			strokeWidth = options.strokeWidth || chart.config.strokeWidth,
			chartTitle = options.chartTitle || null;

		this.base = this.base.append('svg');

		this.comparison = options.comparison;

		this.maxTicks = options.maxTicks || chart.config.maxTicks;

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

		this.x = d3.scale.linear()
			.range([leftMargin / 2, (this.width() - rightMargin - leftMargin)]);

		this.y_1 = d3.scale.linear()
			.range([this.height() - bottomMargin - topMargin, 0]);

		this.xAxis = d3.svg.axis()
			.scale(this.x)
			.orient('bottom');

		this.yAxisLeft = d3.svg.axis()
			.scale(this.y_1)
			.ticks(4)
			.tickSize(-chart.width() + rightMargin + leftMargin)
			.orient('left');

		if (this.comparison) {

			this.wrapper.append('g')
				.attr('class', chart.config.y2Class)
				.attr('transform', 'translate(' + (this.width() - rightMargin - (leftMargin / 2)) + ',0)');

			this.y_2 = d3.scale.linear()
				.range([this.height() - bottomMargin - topMargin, 0]);

			this.yAxisRight = d3.svg.axis()
				.scale(this.y_2)
				.ticks(4)
				.tickSize(-chart.width() + rightMargin + leftMargin)
				.orient('right');
		}

		/* 1st Y axis */

		var line1 = d3.svg.area()
			.interpolate(lineInterpolation)
			.x(function(d, i) {
				return chart.x(d[chart.config.xKey]);
			})
			.y(function(d) {
				return chart.y_1(d[chart.config.y1Key]);
			});

		function insert() {
			return this.insert('path');
		}

		var runs = this.layer(chart.config.line1Class, this.wrapper.append('g').attr('class', chart.config.line1Class).attr('transform', 'translate(' + leftMargin / 2 + ',0)'), {
			dataBind: function(data) {
				return this.selectAll('.' + chart.config.line1Class + ' path').data([data]);
			},
			insert: insert
		});

		runs.on('enter', function onEnterY1() {
			this.attr('d', line1)
				.attr('stroke-width', strokeWidth)
				.attr('fill', 'transparent')
				.attr('stroke', colors[0]);
		});

		runs.on('update:transition', function() {
			this.attr('d', line1);
		});

		if (this.comparison) {

			/* 2nd Y axis */

			var line2 = d3.svg.area()
				.interpolate(lineInterpolation)
				.x(function(d, i) {
					return chart.x(d[chart.config.xKey]);
				})
				.y(function(d) {
					return chart.y_2(d[chart.config.y2Key]);
				});

			var balls = this.layer(chart.config.line2Class, this.wrapper.append('g').attr('class', chart.config.line2Class).attr('transform', 'translate(' + leftMargin / 2 + ',0)'), {
				dataBind: function(data) {
					return this.selectAll('.' + chart.config.line2Class + ' path').data([data]);
				},
				insert: insert
			});

			balls.on('enter', function() {

				this.attr('d', line2)
					.attr('stroke-width', strokeWidth)
					.attr('fill', 'transparent')
					.attr('stroke', colors[1]);
			});

			balls.on('update:transition', function() {

				this.attr('d', line2);
			});
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

		this.x.domain([d3.min(dataSrc, function(d, i) {
			return d[chart.config.xKey];
		}), d3.max(dataSrc, function(d, i) {
			return d[chart.config.xKey];
		})]);

		this.y_1.domain([d3.min(dataSrc, function(d, i) {
			return d[chart.config.y1Key];
		}), d3.max(dataSrc, function(d, i) {
			return d[chart.config.y1Key];
		})]);

		if (this.comparison) {
			this.y_2.domain([d3.min(dataSrc, function(d, i) {
				return d[chart.config.y2Key];
			}), d3.max(dataSrc, function(d, i) {
				return d[chart.config.y2Key];
			})]);
		}

		this.onTransform(dataSrc);
		return dataSrc;
	},

	onTransform: function(dataSrc) {

		this.xAxis
			.ticks((dataSrc.length > this.maxTicks) ? Math.floor(this.width() / this.config.minTickSpacing) : dataSrc.length - 1);

		/* Rescale/update axes on data update */
		this.wrapper.select('.' + this.config.xClass.split(' ').join('.'))
			.call(this.xAxis);

		this.wrapper.select('.' + this.config.y1Class.split(' ').join('.'))
			.call(this.yAxisLeft);

		if (this.comparison) {
			this.wrapper.select('.' + this.config.y2Class.split(' ').join('.'))
				.call(this.yAxisRight);
		}
	}

});