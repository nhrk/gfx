"use strict";

d3.chart("heatmap", {

	config: {
		labelAttr: {
			"font-size": "12px",
			'text-anchor': 'start',
			'style': 'color:#000'
		},
		xGridLength: 5,
		yGridLength: 5,
		strokeColor: '#f1bd7f',
		textColor: '#000',
		wicketColor: "#f9901d",
		keyClass: 'mcr-chart-key',
		margin: 15,
		keyTextAttr: {
			'fill': '#3e9fca',
			'font-size': '0.9em'
		},
		mapKey: 'balls',
		keyLegends: [
			[{
				key : 'WO',
				text : 'Wide outside offstump'
			},{
				key : 'O',
				text : 'Outside Offstump'
			},{
				key : 'S',
				text : 'On the stumps'
			},{
				key : 'L',
				text : 'Down Leg'
			},{
				key : 'WL',
				text : 'Wide down leg'
			}],
			[{
				key : 'Y',
				text : 'Yorker'
			},{
				key : 'F',
				text : 'Full toss'
			},{
				key : 'G',
				text : 'Good length'
			},{
				key : 'S',
				text : 'Short'
			},{
				key : 'SG',
				text : 'Short good length'
			}]
		],
		keyYpos: 12.7,
		textKey: 'wickets',
		keyTextClass: 'mcr-chart-keyText',
		colorRange: ['#ffd5a7', '#ffe570', '#fecf00', '#fdb700', '#fca000', '#fa7700', '#f96200', '#f64500', '#f52c00', '#e20303']
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
			onKeyMouseover = options.onKeyMouseover,
			onKeyMouseout = options.onKeyMouseout,
			onMouseover = options.onMouseover,
			onMouseout = options.onMouseout,
			onBaseClick = options.onBaseClick,
			textHandler = options.textHandler,
			flipLegends = options.flipLegends,
			keyYpos = options.keyYpos || chart.config.keyYpos,
			wrapper;

		this.base = this.base.append("svg");

		this.mapKey = options.mapKey || chart.config.mapKey;

		if(typeof onBaseClick === 'function'){
			this.base.on('click',onBaseClick);
		}

		wrapper = this.base.append('g');

		key = this.base.append('g').attr('class', chart.config.keyClass);

		this.width(options.width || 200);

		this.height(options.height || 400);

		if (legends) {
			margin = chart.config.margin;
			wrapper.attr('transform', 'translate(' + (margin * 2) + ',' + (margin * 2) + ')')
			this.renderLegends({
				keyEl : key,
				keyLegends : keyLegends,
				keyTextAttr : keyTextAttr,
				margin : margin,
				xGridLength : xGridLength, 
				yGridLength : yGridLength,
				onKeyMouseover : onKeyMouseover,
				onKeyMouseout : onKeyMouseout,
				flipLegends : flipLegends,
				keyYpos : keyYpos 
			});
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
				}).on('mouseover', function(d, i) {
					if (typeof onMouseover === 'function') {
						var bbox = this.getBBox();
						onMouseover(d3.event, d, chart.base.node(), bbox);
					}
				}).on('mouseout', function(d, i) {
					if (typeof onMouseout === 'function') {
						var bbox = this.getBBox();
						onMouseout(d3.event, d, chart.base.node(), bbox);
					}
				});

			if (showValues) {
				this.each(function(d, i) {
					var bbox,
						text = d3.select(this.parentNode)
							.append('text')
							.text(typeof textHandler === 'function' ? textHandler(d) : function() {
								return d[chart.config.textKey] ? d[chart.config.textKey] + 'w' : '';
							})
							.attr('fill', textColor)
							.attr(labelAttr)
							.attr('dx', 0)
							.attr('dy', 0)
							.attr("text-anchor", 'start');

					bbox = text.node().getBBox();

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
							.text(typeof textHandler === 'function' ? textHandler(d) : function() {
								return d[chart.config.textKey] ? d[chart.config.textKey] + 'w' : '';
							});

					bbox = text.node().getBBox();

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
			var code = 0,
				percent = (d[chart.mapKey] / chart._sum * 100 || 1);

			// Keeping a simple if else logic until the colors are finalized
			if (percent > 1 && percent < 10) {
				code = 1;
			} else if (percent >= 10 && percent < 20) {
				code = 2;
			} else if (percent >= 20 && percent < 30) {
				code = 3;
			} else if (percent >= 30 && percent < 40) {
				code = 4;
			} else if (percent >= 40 && percent < 60) {
				code = 5;
			} else if (percent >= 60 && percent < 70) {
				code = 6;
			} else if (percent >= 70 && percent < 80) {
				code = 7;
			} else if (percent >= 80 && percent < 90) {
				code = 8;
			} else if (percent >= 90 && percent <= 100) {
				code = 9;
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

	renderLegends: function(options) {
		var chart = this,
			keyEl = options.keyEl,
			keyLegends = options.keyLegends,
			keyTextAttr = options.keyTextAttr,
			margin = options.margin,
			xGridLength = options.xGridLength,
			yGridLength = options.yGridLength,
			onKeyMouseover = options.onKeyMouseover,
			onKeyMouseout = options.onKeyMouseout,
			flipLegends = options.flipLegends,
			keyYpos = options.keyYpos,
			keyText,
			bbox,
			squareHeight = (this.height() - margin) / yGridLength,
			squareWidth = (this.width() - margin) / xGridLength;

		for (var i = 0, len = keyLegends.length; i < len; i++) {

			if(flipLegends && i === 0){
				keyLegends[i] = keyLegends[i].slice(0).reverse();
			}

			for (var j = 0, jLen = keyLegends[i].length; j < jLen; j++) {

				keyText = keyEl.append('text').text(keyLegends[i][j].length ? keyLegends[i][j] : keyLegends[i][j].key || '')
					.attr('class', chart.config.keyTextClass)
					.attr(keyTextAttr);

				if (i === 0) {
					keyText.attr('dy', 10)
						.attr('dx', 0)
						.attr('text-anchor', 'middle');

					bbox = keyText.node().getBBox();
					keyText.attr('dx', (j * (chart.width() - margin) / xGridLength) + margin + squareWidth/2);

				} else if (i === 1) {
					keyText.attr('dy', 0)
						.attr('text-anchor', 'end')
						.attr('dx', keyYpos);

					bbox = keyText.node().getBBox();
					keyText.attr('dy', (j * (chart.height() - margin) / yGridLength) + margin + squareHeight/2);
				}

				// Closure to access iterators after the loop
				(function(i,j){
					if(typeof onKeyMouseover === 'function' && !keyLegends[i][j].length){
						keyText.on('mouseover', function(){
							onKeyMouseover(d3.event, keyLegends[i][j])
						})
					}
					if(typeof onKeyMouseout === 'function' && !keyLegends[i][j].length){
						keyText.on('mouseout', function(){
							onKeyMouseout(d3.event, keyLegends[i][j])
						})
					}
				}(i,j))
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
		var chart = this;
		this._sum = d3.sum(dataSrc, function(d) {
			return Number(d[chart.mapKey]);
		});
		return dataSrc;
	}

});