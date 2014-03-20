"use strict";

d3.chart("stacked", {

	config : {
		space : 1,
		barSpacing : 27,
		colors : ["#aad", "#8080a2", "#556"],
		strokeColor : "rgb(6,120,155)",
		topMargin : 25,
		titleHeight : 13,
		keySquareSize : 13,
		keySpacing : 55,
		keyLeftMargin : 0,
		keyTextRightMargin : 16,
		keyTextBottomMargin : 11,
		keyClass : 'key',
		leftStackClass : 'left',
		rightStackClass : 'right',
		titleAttr : {"font-weight":"bold","font-size":"1.2em"},
		labelAttr : {"font-size":"1em"},
		valueAttr : {"font-size":"1.1em"},
		titleClass : 'title',
		labelClass : 'label',
		valueClass : 'value'
	},

	initialize: function(options) {

		options = options || {};

		var chart = this,
			barSpacing = this.config.barSpacing || options.barSpacing,
			barHeight = options.barHeight || null,
			hideLine = options.hideLine,
			hideText = options.hideText,
			hideLabel = options.hideLabel,
			showValue = options.showValue,
			keyLeftMargin = options.keyLeftMargin || chart.config.keyLeftMargin,
			strokeColor = options.strokeColor || this.config.strokeColor,
			titleAttr = options.titleAttr || this.config.titleAttr,
			labelAttr = options.labelAttr || this.config.labelAttr,
			valueAttr = options.valueAttr || this.config.valueAttr,
			labelPos = options.labelPos,
			varyColors = options.varyColors,
			space = options.space || this.config.space;

		this.topMargin = options.topMargin || this.config.topMargin;

		this.base = this.base.append("svg");

		this.height(options.height || 400);

		this.width(options.width || 400);

		this.colors = options.colors || chart.config.colors;

		this.base.attr("width", chart.width())
			.attr("height", chart.height());

		this.leftWrapper = this.base.append("g").attr('class',chart.config.leftStackClass);

		this.rightWrapper = this.base.append("g").attr('class',chart.config.rightStackClass);

		this.y = d3.scale.ordinal();

		this.x = d3.scale.linear();

		this.color = d3.scale.linear();

		/* Right */

		this.layer("rightAxis", this.rightWrapper, {
			dataBind: dataBind,
			insert: insert
		});

		function dataBind(data) {
			data = data.right
			return this.selectAll("rect")
						.data(data, function(d,i){
							return d.stackId;
						});
		}

		function insert() {
			return this.append('g').insert('rect');
		}

		function onEnter(){

			this.attr("y", function(d) { return chart.y(d.x); })
				.attr("x", function(d) { return (chart.x(d.y0)/2 + chart.width()/2) + space/2; })
				.attr('fill',function(d,i){
					if(varyColors){
						return chart.colors[0];
					}
					return chart.color(d.layer);
				})
				.attr("height", getBarHeight)
				.attr("width", function(d) { return chart.x(d.y)/2; });

				// TODO: Move to a new layer? & Improve solution for adding/updating text
				if(!hideLine || !hideText || !hideLabel || showValue){

					this.each(function(d,i){

						var parent = d3.select(this.parentNode),
							height,
							text,
							bbox;

						if(!hideText && d.title){
							text = parent.append('text')
								.attr('class',chart.config.titleClass)
								.attr('dx',chart.width()/2)
								.attr('dy',chart.y(d.x))
								.attr(titleAttr)
								.text(d.title);

							bbox = text[0][0].getBBox();
							//place text element in DOM, calculate dimensions and reassign dx dy to center text
							text.attr('dx',chart.width()/2 - bbox.width/2)
							text.attr('dy',chart.y(d.x) - bbox.height/2)
						}

						if(!hideLabel && d.label){
							text = parent.append('text')
								.attr('class',chart.config.labelClass)
								.attr('dx',chart.width()/2)
								.attr('text-anchor','end')
								.attr('dy',chart.y(d.x))
								.attr(labelAttr)
								.text(d.label);

							bbox = text[0][0].getBBox();

							text.attr('dx',chart.width());

							/* TODO: Make more flexible. Right now, only used in preferred shot graph */
							if(labelPos === 'bottom'){
								text.attr('dy',chart.y(d.x) + getBarHeight() + bbox.height)
									.attr('dx',chart.width()/2 + bbox.width + (space * 4));
							}else{
								text.attr('dy',chart.y(d.x) - bbox.height/2);
							}
						}

						height = (bbox && bbox.height);

						height = height ? height: chart.config.titleHeight;

						if(!hideLine){
							parent.append('line')
								.style("stroke", strokeColor)
								.attr('x1', chart.width()/2)
								.attr('y1', chart.y(d.x) - height)
								.attr('x2', chart.width()/2)
								.attr('y2', function(){
									return (i==0) ? 0 : chart.y(d.x) - (chart.y(1) - chart.y(0) - getBarHeight());
								});
						}

						if(showValue){
							text = parent.append('text')
								.attr('class', chart.config.valueClass)
								.attr('dx', chart.x(d.y)/4 + (chart.x(d.y0)/2 + chart.width()/2) + space/2)
								.attr(valueAttr)
								.text(function(){
									return (d.y > 0) ? d.y : '';
								});

							bbox = text[0][0].getBBox();

							text.attr('dy', chart.y(d.x) + (getBarHeight()/2) + (bbox.height/4));
						}
					});
				}
		}

		function onTrans(){
			this.attr("y", function(d) { return chart.y(d.x); })
				.attr("x", function(d) { return (chart.x(d.y0)/2 + chart.width()/2) + space/2; })
				.attr("height", getBarHeight)
				.attr("width", function(d) { return chart.x(d.y)/2; });

			if(!hideText || !hideLabel || showValue){

				this.each(function(d,i){
					var parent = d3.select(this.parentNode),
						text,
						bbox;

					if(!hideLabel && d.label){
						parent.select('.' + chart.config.labelClass)
						.text(d.label);
					}

					if(!hideText && d.title){
						parent.select('.' + chart.config.titleClass)
						.text(d.title);
					}

					if(showValue){
						text = parent.select('.' + chart.config.valueClass)
						.attr('dx', (chart.x(d.y)/4) + ((chart.x(d.y0)/2 + chart.width()/2) + space/2))
						.text(function(){
							return (d.y > 0) ? d.y : '';
						});

						bbox = text[0][0].getBBox();
						
						text.attr('dy', chart.y(d.x) + (getBarHeight()/2) + (bbox.height/4));
					}
				});
			}
		}

		function onExit(){
			/* TODO: Remove nodes */
		}

		this.layer("rightAxis").on("exit", onExit);
		this.layer("rightAxis").on("enter", onEnter);
		this.layer("rightAxis").on("update:transition", onTrans);

		/* Left */

		this.layer("leftAxis", this.leftWrapper, {
			dataBind: dataBindLeft,
			insert: insert
		});

		function dataBindLeft(data) {
			data = data.left
			return this.selectAll("rect")
						.data(data, function(d,i){
							return d.stackId;
						});
		}

		function onEnterLeft(){
			this.attr("y", function(d) { return chart.y(d.x); })
				.attr("x", function(d) { return (chart.width() - chart.x(d.y) - chart.x(d.y0))/2 - space/2; })
				.attr('fill',function(d,i){
					if(varyColors){
						return chart.colors[1];
					}
					return chart.color(d.layer);
				})
				.attr("height", getBarHeight)
				.attr("width", function(d) { return chart.x(d.y)/2; });

				if(!hideLabel || showValue){

					this.each(function(d,i){
						
						var parent = d3.select(this.parentNode),
							text,
							bbox;

							if(!hideLabel && d.label){
								text = parent.append('text')
									.attr('dx',0)
									.attr('class',chart.config.labelClass)
									.attr('text-anchor','start')
									.attr('dy',chart.y(d.x))
									.attr(labelAttr)
									.text(d.label);

								bbox = text[0][0].getBBox();

								if(labelPos === 'bottom'){
									text.attr('dy',chart.y(d.x) + getBarHeight() + bbox.height)
										.attr('dx',chart.width()/2 - bbox.width - (space * 4));
								}else{
									text.attr('dy',chart.y(d.x) - bbox.height/2);
								}
							}

							if(showValue){
								text = parent.append('text')
									.attr('class',chart.config.valueClass)
									.attr('dx', (chart.x(d.y)/4) + ((chart.width() - chart.x(d.y) - chart.x(d.y0))/2 - space/2))
									.attr(valueAttr)
									.text(function(){
										return (d.y > 0) ? d.y : '';
									});

								bbox = text[0][0].getBBox();
								text.attr('dy', chart.y(d.x) + (getBarHeight()/2) + (bbox.height/4));
							}
					});
				}
				
		}

		function onTransLeft(){
			this.attr("y", function(d) { return chart.y(d.x); })
				.attr("x", function(d) { return (chart.width() - chart.x(d.y) - chart.x(d.y0))/2 - space/2; })
				.attr("height", getBarHeight)
				.attr("width", function(d) { return chart.x(d.y)/2; });

			if(!hideLabel || showValue){

				this.each(function(d,i){

					var parent = d3.select(this.parentNode),
						text,
						bbox;

					if(d.label){
						parent.select('.' + chart.config.labelClass)
						.text(d.label);
					}

					if(showValue){
						text = parent.select('.' + chart.config.valueClass)
						.attr('dx', chart.x(d.y)/4 + (chart.width() - chart.x(d.y) - chart.x(d.y0))/2 - space/2)
						.text(function(){
							return (d.y > 0) ? d.y : '';
						});

						bbox = text[0][0].getBBox();

						text.attr('dy', chart.y(d.x) + (getBarHeight()/2) + (bbox.height/4));
					}
				});
			}
		}

		function getBarHeight(){
			var height = (barHeight || chart.y.rangeBand() - barSpacing);
			return (height > 0) ? height : 1;
		}

		function onExitLeft(){
			/* TODO: Remove nodes */
		}

		this.layer("leftAxis").on("enter", onExitLeft);
		this.layer("leftAxis").on("enter", onEnterLeft);
		this.layer("leftAxis").on("update:transition", onTransLeft);

		/* Key */

		if(options.key && options.key.length){

			this.layer("key", this.base.append("g").attr('class',chart.config.keyClass), {

				dataBind: function(data) {
					return this.selectAll("rect")
						.data(options.key);
				},

				insert: function() {
					return this.append("rect");
				},

				events: {
					enter: function() {
						this.attr("x", function(d,i){
							return (chart.config.keySpacing * i) + (keyLeftMargin);
						})
						.attr("y", chart.config.keyYPos)
						.attr("height", chart.config.keySquareSize)
						.attr("width", chart.config.keySquareSize)
						.style("fill", function(d,i){
							return chart.color(i);
						}).each(function(d,i){
							chart.base.select('.' + chart.config.keyClass).append('text')
								.attr('dx',function(){
									return (chart.config.keySpacing * i) + (keyLeftMargin + chart.config.keyTextRightMargin);
								})
								.attr('dy',function(){
									return chart.config.keyTextBottomMargin;
								})
								.text(function(){
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

		/* TODO: data checks */
		var stack = d3.layout.stack(),
			leftStack = dataSrc[0],
			rightStack = dataSrc[1],
			y0StackMax,
			y1StackMax;

		this.length = leftStack[0].length; //assuming both data sets are equal in length

		leftStack = stack(leftStack);

		rightStack = stack(rightStack);

		// get the largest layer from each stack and use the higher value for x domain
		y0StackMax = d3.max(leftStack, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

		y1StackMax = d3.max(rightStack, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

		this.x.domain([0, Math.max(y0StackMax,y1StackMax)])
			.range([0, this.width()]);

		this.y.domain(d3.range(this.length))
			.rangeBands([this.topMargin, this.height() + this.topMargin/2]);

		this.color.domain(d3.range(dataSrc[0].length))
			.range(this.colors);

		// Merge nested Arrays to simplify data binding/updating
		return {left: d3.merge(leftStack), right: d3.merge(rightStack)};
	}

});