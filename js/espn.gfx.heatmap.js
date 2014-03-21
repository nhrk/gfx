"use strict";

d3.chart("heatmap", {

	config : {
		labelAttr : {"font-size": "12px", 'text-anchor': 'start', 'style': 'color:#000'},
		gridSize : 5,
		strokeColor : '#f1bd7f',
		textColor : '#000',
		wicketColor : "#f9901d",
		keyClass : 'key',
		margin : 15,
		keyTextAttr : {'fill': '#3e9fca', 'font-size': '0.9em'},
		key : [['WO','O','S','L','WL'],['Y','F','G','S','SG']],
		keyTextClass : 'keyTextClass', 
		colorRange : ["#ffcb92","#ffe401", "#fdcd00","#ffba00","#ff9c00","#ff7204","#fe5400","#fd3100","#f40000"]
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
			margin = 0;

		this.base = this.base.append("svg");

		this.wrapper = this.base.append('g');

		this.key = this.base.append('g').attr('class',chart.config.keyClass);

		this.width(options.width || 200);

		this.height(options.height || 400);

		if(legends){
			margin = chart.config.margin;
			this.wrapper.attr('transform','translate(' + (margin*2) + ',' + (margin*2) + ')')
			this.renderLegends(margin, keyTextAttr);
		}

		squareHeight = (this.height() - margin) / chart.config.gridSize;

		squareWidth = (this.width() - margin) / chart.config.gridSize;

		this.colorScale = d3.scale.quantile()
			.domain([0, 7, 100])
			.range(colorRange);

		function getGridPosition(i){
			return {
				row : Math.ceil(i/chart.config.gridSize),
				column : i - (Math.floor(i/chart.config.gridSize) * chart.config.gridSize) || chart.config.gridSize
			};
		}

		function onEnter() {

		  this.attr("x", function(d,i){
		  			var pos = getGridPosition(i+1);
		  			return (pos.column * squareWidth) - squareWidth - margin;
		  		})
				.attr("y", function(d,i) { 
					var pos = getGridPosition(i+1);
					return (pos.row * squareHeight) - squareHeight - margin;
				})
				.attr('stroke', chart.config.strokeColor)
				.attr('fill', getColorCode)
				.attr("width", squareWidth)
				.attr("height", function(d,i){
						return squareHeight;
				});

				if(showValues){
					this.each(function(d,i){
						var bbox,
							text = d3.select(this.parentNode)
									.append('text')
										.text(function(){
											return d.wickets ? d.wickets + 'w' : '';
										})
										.attr('fill',textColor)
										.attr(labelAttr)
										.attr('dx',0)
										.attr('dy',0)
										.attr("text-anchor",'start');
						
						bbox = text[0][0].getBBox();

						// Re set x y pos based on text elements dimensions
						text.attr('dx',function(){
								var pos = getGridPosition(i+1);
								return (pos.column * squareWidth) - (squareWidth/2) - (bbox.width/2) - margin;
							})
							.attr('dy',function() { 
								var pos = getGridPosition(i+1);
								return (pos.row * squareHeight) - (squareHeight/2) + (bbox.height/2) - margin;
							});
					});
				}
		}

		function onTrans() {

			if(showValues){
				this.each(function(d,i){

					var bbox,
						text = d3.select(this.parentNode).select('text')
							.text(function() {
								return d.wickets ? d.wickets + 'w' : '';
							});

						bbox = text[0][0].getBBox();

						text.attr('dx',function(){
							var pos = getGridPosition(i+1);
							return (pos.column * squareWidth) - (squareWidth/2) - (bbox.width/2) - margin;
					});
				});
			}

			this.attr('fill',getColorCode);
		}

		function getColorCode(d,i){
			// Switched from the colorScale to manual computation based on request
			var code;
			if(d.runs >= 0 && d.runs < 10){
				code = 0;
			}else if(d.runs >= 10 && d.runs < 20){
				code = 1;
			}else if(d.runs >= 20 && d.runs < 30){
				code = 3;
			}else if(d.runs >= 30 && d.runs < 40){
				code = 4;
			}else if(d.runs >= 40 && d.runs < 60){
				code = 5;
			}else if(d.runs >= 60 && d.runs < 70){
				code = 6;
			}else if(d.runs >= 70 && d.runs < 85){
				code = 7;
			}else if(d.runs >= 85){
				code = 8;
			}
			return colorRange[code];
		}

		function dataBind(data) {
		  return this.selectAll("rect")
			.data(data, function(d) { return d.zone; });
		}

		function insert() {
		  return this.append('g').insert("rect", "line");
		}

		var zones = this.layer("zones", this.wrapper, {
		  dataBind: dataBind,
		  insert: insert
		});

		zones.on("enter", onEnter);
		zones.on("update:transition", onTrans);

	},

	renderLegends: function(margin, keyTextAttr){
		var chart = this,
			key = chart.config.key,
			keyText,
			bbox;

		for(var i = 0, len = key.length; i < len; i++){

			for(var j = 0, jLen = key[i].length; j < jLen; j++){
				
				keyText = chart.key.append('text').text(key[i][j])
							.attr('class',chart.config.keyTextClass)
							.attr(keyTextAttr);

				if( i === 0 ){
					keyText.attr('dy', 10)
						.attr('dx', 0)
						.attr('text-anchor','start');
						
					bbox = keyText[0][0].getBBox();
					keyText.attr('dx',(j * (chart.width() - margin)/chart.config.gridSize) - (bbox.width/2))
						.attr('transform','translate(' + margin + ',0)');

				}else if(i === 1){
					keyText.attr('dy', 0)
						.attr('text-anchor','middle')
						.attr('dx', 7);

					bbox = keyText[0][0].getBBox();
					keyText.attr('dy',(j * (chart.height() - margin)/chart.config.gridSize) + (bbox.height))
						.attr('transform','translate(0,' + margin + ')');
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
		return dataSrc;
	}

});