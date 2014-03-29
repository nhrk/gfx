"use strict";

d3.chart("heatmap", {

	config: {
		labelAttr: {
			"font-size": "12px",
			'text-anchor': 'start',
			'style': 'color:#000'
		},
		xGridLength : 5,
		yGridLength : 5,
		strokeColor: '#f1bd7f',
		textColor: '#000',
		wicketColor: "#f9901d",
		keyClass: 'key',
		margin: 15,
		keyTextAttr: {
			'fill': '#3e9fca',
			'font-size': '0.9em'
		},
		keyLegends: [
			['WO', 'O', 'S', 'L', 'WL'],
			['Y', 'F', 'G', 'S', 'SG']
		],
		keyTextClass: 'keyTextClass',
		colorRange: ["#ffcb92", "#ffe401", "#fdcd00", "#ffba00", "#ff9c00", "#ff7204", "#fe5400", "#fd3100", "#f40000"]
	},

	initialize: function(options) {

		options = options || {};

		var chart = this,
			labelAttr = options.labelAttr || this.config.labelAttr,
			squareHeight,
			squareWidth,
			legends = options.legends,
			showValues = options.showValues,
			textColor = options.textColor || chart.config.textColor,
			wicketColor = options.wicketColor || chart.config.wicketColor,
			colorRange = options.colorRange || this.config.colorRange,
			keyTextAttr = options.keyTextAttr || this.config.keyTextAttr,
			xGridLength = options.xGridLength || this.config.xGridLength,
			yGridLength = options.yGridLength || this.config.yGridLength,
			margin = 0,
			keyLegends = options.keyLegends || this.config.keyLegends,
			key,
			wrapper;

		this.base = this.base.append("svg");

		wrapper = this.base.append('g');

		key = this.base.append('g').attr('class', chart.config.keyClass);

		this.width(options.width || 200);

		this.height(options.height || 400);

		if (legends) {
			margin = chart.config.margin;
			wrapper.attr('transform', 'translate(' + (margin * 2) + ',' + (margin * 2) + ')')
			/* TODO: use obj, too many args */
			this.renderLegends(key, keyLegends, keyTextAttr, margin, xGridLength, yGridLength);
		}

		squareHeight = (this.height() - margin) / yGridLength;

		squareWidth = (this.width() - margin) / xGridLength;

		this.colorScale = d3.scale.quantile()
			.domain([0, 7, 100])
			.range(colorRange);

		function getGridPosition(i) {
			return {
				row: Math.ceil(i / xGridLength),
				column: i - (Math.floor(i / xGridLength) * xGridLength) || xGridLength
			};
		}

		function onEnter() {

			this.attr("x", function(d, i) {
				var pos = getGridPosition(i + 1);
				return (pos.column * squareWidth) - squareWidth - margin;
			})
				.attr("y", function(d, i) {
					var pos = getGridPosition(i + 1);
					return (pos.row * squareHeight) - squareHeight - margin;
				})
				.attr('stroke', chart.config.strokeColor)
				.attr('fill', getColorCode)
				.attr("width", squareWidth)
				.attr("height", function(d, i) {
					return squareHeight;
				});

			if (showValues) {
				this.each(function(d, i) {
					var bbox,
						text = d3.select(this.parentNode)
							.append('text')
							.text(function() {
								return d.wickets ? d.wickets + 'w' : '';
							})
							.attr('fill', textColor)
							.attr(labelAttr)
							.attr('dx', 0)
							.attr('dy', 0)
							.attr("text-anchor", 'start');

					bbox = text[0][0].getBBox();

					// Re set x y pos based on text elements dimensions
					text.attr('dx', function() {
						var pos = getGridPosition(i + 1);
						return (pos.column * squareWidth) - (squareWidth / 2) - (bbox.width / 2) - margin;
					})
						.attr('dy', function() {
							var pos = getGridPosition(i + 1);
							return (pos.row * squareHeight) - (squareHeight / 2) + (bbox.height / 2) - margin;
						});
				});
			}
		}

		function onTrans() {

			if (showValues) {
				this.each(function(d, i) {

					var bbox,
						text = d3.select(this.parentNode).select('text')
							.text(function() {
								return d.wickets ? d.wickets + 'w' : '';
							});

					bbox = text[0][0].getBBox();

					text.attr('dx', function() {
						var pos = getGridPosition(i + 1);
						return (pos.column * squareWidth) - (squareWidth / 2) - (bbox.width / 2) - margin;
					});
				});
			}

			this.attr('fill', getColorCode);
		}

		function getColorCode(d, i) {
			// Switched from the colorScale to manual computation based on product request
			var code,
				percent = (d.runs/chart._sum * 100 || 1);

			if (percent >= 0 && percent < 10) {
				code = 0;
			} else if (percent >= 10 && percent < 20) {
				code = 1;
			} else if (percent >= 20 && percent < 30) {
				code = 3;
			} else if (percent >= 30 && percent < 40) {
				code = 4;
			} else if (percent >= 40 && percent < 60) {
				code = 5;
			} else if (percent >= 60 && percent < 70) {
				code = 6;
			} else if (percent >= 70 && percent < 85) {
				code = 7;
			} else if (percent >= 85) {
				code = 8;
			}

			return colorRange[code];
		}

		function dataBind(data) {
			return this.selectAll("rect")
				.data(data, function(d) {
					return d.zone;
				});
		}

		function insert() {
			return this.append('g').insert("rect", "line");
		}

		var zones = this.layer("zones", wrapper, {
			dataBind: dataBind,
			insert: insert
		});

		zones.on("enter", onEnter);
		zones.on("update:transition", onTrans);

	},

	renderLegends: function(keyEl, keyLegends, keyTextAttr, margin, xGridLength, yGridLength) {
		var chart = this,
			keyText,
			bbox;

		for (var i = 0, len = keyLegends.length; i < len; i++) {

			for (var j = 0, jLen = keyLegends[i].length; j < jLen; j++) {

				keyText = keyEl.append('text').text(keyLegends[i][j])
					.attr('class', chart.config.keyTextClass)
					.attr(keyTextAttr);

				if (i === 0) {
					keyText.attr('dy', 10)
						.attr('dx', 0)
						.attr('text-anchor', 'start');

					bbox = keyText[0][0].getBBox();
					keyText.attr('dx', (j * (chart.width() - margin) / xGridLength) - (bbox.width / 2))
						.attr('transform', 'translate(' + margin + ',0)');

				} else if (i === 1) {
					keyText.attr('dy', 0)
						.attr('text-anchor', 'middle')
						.attr('dx', 7);

					bbox = keyText[0][0].getBBox();
					keyText.attr('dy', (j * (chart.height() - margin) / yGridLength) + (bbox.height))
						.attr('transform', 'translate(0,' + margin + ')');
				}
			}
		}
	},

	width: function(newWidth) {
		if (!arguments.length) {
			return this._width;
		}
		this._width = newWidth;
		this.base.attr("width", this._width);
		return this;
	},

	height: function(newHeight) {
		if (!arguments.length) {
			return this._height;
		}
		this._height = newHeight;
		this.base.attr("height", this._height);
		return this;
	},

	transform: function(dataSrc) {
		/* TODO: type checks */

		this._sum = d3.sum(dataSrc,function(d){
							return d.runs;
						});
		return dataSrc;
	}

});