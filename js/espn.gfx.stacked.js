d3.chart("stacked", {

	config : {
		space : 2,
		barSpacing : 27,
		colors : ["#aad", "#8080a2", "#556"],
		strokeColor : "rgb(6,120,155)",
		topMargin : 25,
		titleHeight : 13,
		keySquareSize : 13,
		keySpacing : 55,
		keyRightMargin : 16,
		keyBottomMargin : 11,
		keyClass : 'key',
		keyYPos : 0,
		leftStackClass : 'left',
		rightStackClass : 'right',
		titleAttr : {"font-weight":"bold","font-size":"1.2em"},
		labelAttr : {"font-size":"1em"},
		titleClass : 'title',
		labelClass : 'label'
	},

	initialize: function(options) {

		options = options || {};

		var chart = this,
			barSpacing = this.config.barSpacing || options.barSpacing,
			barHeight = options.barHeight || null,
			hideLine = options.hideLine,
			hideText = options.hideText,
			hideLabel = options.hideLabel,
			strokeColor = options.strokeColor || this.config.strokeColor,
			titleAttr = options.titleAttr || this.config.titleAttr,
			labelAttr = options.labelAttr || this.config.labelAttr,
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
				.attr('style',function(d,i){
					return 'fill:' + chart.color(d.layer);
				})
				.attr("height", function(){
					var height = (barHeight || chart.y.rangeBand() - barSpacing);
					return (height > 0) ? height : 1;
				})
				.attr("width", function(d) { return chart.x(d.y)/2; });

				// TODO: Move to a new layer? & Improve solution
				if(!hideLine || !hideText || !hideLabel){
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
								.text(function(){
									return d.title;
								});
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
								.text(function(){
									return d.label;
								});
							bbox = text[0][0].getBBox();
							text.attr('dx',chart.width())
							text.attr('dy',chart.y(d.x) - bbox.height/2)
						}

						height = (bbox && bbox.height);
						height = height ? height: chart.config.titleHeight;
						barHeight  = (barHeight || chart.y.rangeBand() - barSpacing);

						if(!hideLine){
							parent.append('line')
								.style("stroke", strokeColor)
								.attr('x1',chart.width()/2)
								.attr('y1',chart.y(d.x) - height)
								.attr('x2',chart.width()/2)
								.attr('y2',function(){
									return (i==0) ? 0 : chart.y(d.x) - (chart.y(1) - chart.y(0) - barHeight);
								});
						}
					});
				}
		}

		function onTrans(){
			this.attr("y", function(d) { return chart.y(d.x); })
				.attr("x", function(d) { return (chart.x(d.y0)/2 + chart.width()/2) + space/2; })
				.attr("height", function(){
					var height = (barHeight || chart.y.rangeBand() - barSpacing);
					return (height > 0) ? height : 1;
				})
				.attr("width", function(d) { return chart.x(d.y)/2; });

			if(!hideText || !hideLabel){

				this.each(function(d,i){
					var parent = d3.select(this.parentNode);

					if(!hideLabel && d.label){
						parent.select('.' + chart.config.labelClass)
						.text(function(){
							return d.label;
						});
					}

					if(!hideText && d.title){
						parent.select('.' + chart.config.titleClass)
						.text(function(){
							return d.title;
						});
					}

				});
			}
		}

		function onExit(){
			/* TODO: Remove nodes */
		}

		this.layer("rightAxis").on("merge", function(){
			this.selectAll('rect')
				.attr("y", function(d) { return chart.y(d.x); })
				.attr("x", function(d) { return (chart.x(d.y0)/2 + chart.width()/2) + space/2; })
				.attr("height", function(){
					return (barHeight || chart.y.rangeBand() - barSpacing);
				})
				.attr("width", function(d) { return chart.x(d.y)/2; });
		});

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
				.attr('style',function(d,i){
					return 'fill:' + chart.color(d.layer);
				})
				.attr("height", function(){
					var height = (barHeight || chart.y.rangeBand() - barSpacing);
					return (height > 0) ? height : 1;
				})
				.attr("width", function(d) { return chart.x(d.y)/2; });

				if(!hideLabel){
					this.each(function(d,i){
							if(d.label){
								var parent = d3.select(this.parentNode),
								text = parent.append('text')
									.attr('dx',0)
									.attr('class',chart.config.labelClass)
									.attr('text-anchor','start')
									.attr('dy',chart.y(d.x))
									.attr(labelAttr)
									.text(function(){
										return d.label;
									});
								bbox = text[0][0].getBBox();
								text.attr('dy',chart.y(d.x) - bbox.height/2)
							}
					});
				}
				
		}

		function onTransLeft(){
			this.attr("y", function(d) { return chart.y(d.x); })
				.attr("x", function(d) { return (chart.width() - chart.x(d.y) - chart.x(d.y0))/2 - space/2; })
				.attr("height", function(){
					var height = (barHeight || chart.y.rangeBand() - barSpacing);
					return (height > 0) ? height : 1;
				})
				.attr("width", function(d) { return chart.x(d.y)/2; });

			if(!hideLabel){
				this.each(function(d,i){
					if(d.label){
						d3.select(this.parentNode)
						.select('.' + chart.config.labelClass)
						.text(function(){
							return d.label;
						});
					}
				});
			}
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
							return (chart.config.keySpacing * i);
						})
						.attr("y", chart.config.keyYPos)
						.attr("height", chart.config.keySquareSize)
						.attr("width", chart.config.keySquareSize)
						.style("fill", function(d,i){
							return chart.color(i);
						}).each(function(d,i){
							// Setting values through config, as centering text, requires to calculate its dimensions
							chart.base.select('.' + chart.config.keyClass).append('text')
								.attr('dx',function(){
									return (chart.config.keySpacing * i) + (chart.config.keyRightMargin);
								})
								.attr('dy',function(){
									return chart.config.keyBottomMargin;
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

		/* TODO: type checks */
		var stack = d3.layout.stack(),
			leftStack = dataSrc[0],
			rightStack = dataSrc[1];

		this.length = leftStack[0].length; //assuming both data sets are equal in length

		leftStack = stack(leftStack);

		rightStack = stack(rightStack);

		//the largest single layer
		this.yGroupMax = d3.max(leftStack, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
		//the largest stack
		this.yStackMax = d3.max(leftStack, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });            

		this.y.domain(d3.range(this.length))
			.rangeRoundBands([this.topMargin, this.height()], .08);

		this.x.domain([0, this.yStackMax])
			.range([0, this.width()]);

		this.color.domain(d3.range(dataSrc[0].length))
			.range(this.colors);

		// Merge nested Arrays to simplify data binding/updating
		return {left: d3.merge(leftStack), right: d3.merge(rightStack)};
	}

});