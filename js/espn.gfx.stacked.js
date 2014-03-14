d3.chart("stacked", {

	config : {
		space : 2,
		barSpacing : 27,
		lineHeight : 20,
		lineY : -20,
		colors : ["#aad", "#556"],
		strokeColor : "rgb(6,120,155)"
	},

	initialize: function(options) {

		options = options || {};

		var chart = this,
			barSpacing = this.config.barSpacing || options.barSpacing,
			barHeight = options.barHeight || null,
			hideLine = options.hideLine,
			hideText = options.hideText,
			lineHeight = options.lineHeight || this.config.lineHeight,
			lineY = options.lineY || this.config.lineY,
			strokeColor = options.strokeColor || this.config.strokeColor,
			space = options.space || this.config.space;

		this.base = this.base.append("svg");

		this.height(options.height || 400);

		this.width(options.width || 400);

		this.colors = options.colors || chart.config.colors;

		this.base.attr("width", chart.width())
			.attr("height", chart.height());

		this.y = d3.scale.ordinal();

		this.x = d3.scale.linear();

		this.color = d3.scale.linear();

		/* Left */

		this.layer("leftAxis", this.base.append("g"), {
			dataBind: dataBind,
			insert: insert
		});

		function dataBind(data) {
			data = data.left
			var rect = this.selectAll("g")
						.data(data,function(d,i){
							return data.indexOf(d);
						}).enter().append("g")
						.attr('class',function(d,i){
							return 'left stack_' + i;
						})
						.attr('style',function(d,i){
							return 'fill:' + chart.color(i);
						}).selectAll("rect");
			
			return rect.data(function (d,i){
						return d;
					});
		}

		function insert() {
			return this.append("rect");
		}

		function onEnter(){
			this.attr("y", function(d) { return chart.y(d.x); })
				.attr("x", function(d) { return (chart.x(d.y0)/2 + chart.width()/2) + space/2; })
				.attr("height", function(){
					return (barHeight || chart.y.rangeBand() - barSpacing);
				})
				.attr("width", function(d) { return chart.x(d.y)/2; });

				if(!hideLine || !hideText){
					this.each(function(d,i){
						var parent = d3.select(this.parentNode)
						if(!hideLine){
							parent
								.append('line')
								.style("stroke", strokeColor)
								.attr('x1',chart.width()/2)
								.attr('y1',chart.y(d.x) + lineY)
								.attr('x2',chart.width()/2)
								.attr('y2',chart.y(d.x) - lineHeight + lineY);
						}
						if(!hideText){
							parent.append('text')
								.attr('dx',chart.width()/2 - 10) //add config and cacl text width to center
								.attr('dy',chart.y(d.x) - 5)
								.text(function(){
									return d.label;
								});
						}	
					});
				}
		}

		function onTrans(){
			chart.base.selectAll('.left rect').each(function(d,i){
				d3.select(this.parentNode).remove();
			});
		}

		this.layer("leftAxis").on("enter", onEnter);
		this.layer("leftAxis").on("update:transition", onTrans);

		/* Right */

		this.layer("rightAxis", this.base.append("g"), {
			dataBind: dataBindRight,
			insert: insertRight
		});

		function dataBindRight(data) {
			data = data.right
			var rect = this.selectAll("g")
						.data(data,function(d,i){
							return data.indexOf(d);
						}).enter().append("g")
						.attr('class',function(d,i){
							return 'right stack_' + i;
						})
						.attr('style',function(d,i){
							return 'fill:' + chart.color(i);
						}).selectAll("rect");
			
			return rect.data(function (d,i){
						return d;
					});
		}

		function insertRight() {
			/* TODO: Improve markup, wrap rect and text in g */
			return this.append("rect");
		}

		function onEnterRight(){
			this.attr("y", function(d) { return chart.y(d.x); })
				.attr("x", function(d) { return (chart.width() - chart.x(d.y) - chart.x(d.y0))/2 - space/2; })
				.attr("height", function(){
					return (barHeight || chart.y.rangeBand() - barSpacing);
				})
				.attr("width", function(d) { return chart.x(d.y)/2; });
				
		}

		function onTransRight(){
			chart.base.selectAll('.right rect').each(function(d,i){
				d3.select(this.parentNode).remove();
			});
		}

		this.layer("rightAxis").on("enter", onEnterRight);
		this.layer("rightAxis").on("update:transition", onTransRight);

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

		/* TODO: Needs cleanups! */
		var data = dataSrc.data,
			layerCount = dataSrc.layers,
			stack = d3.layout.stack(),
			leftStack,
			rightStack;

		// Build stack data
		function buildStackData(index){
			return d3.range(layerCount).map(function(d) {
				var arr = [];
				for (var i = 0, len = data[index].length; i < len; ++i) {
					arr[i] = {x: i, y: data[index][i]['stack_' + (d+1)], 'label' : data[index][i].key};
				}
				return arr;
			});
		}

		leftStack = stack(buildStackData(0));

		rightStack = stack(buildStackData(1));

		//the largest single layer
		this.yGroupMax = d3.max(leftStack, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
		//the largest stack
		this.yStackMax = d3.max(leftStack, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });            

		this.y.domain(d3.range(data[0].length))
			.rangeRoundBands([2, this.height()], .08);

		this.x.domain([0, this.yStackMax])
			.range([0, this.width()]);

		this.color.domain([0, layerCount - 1])
			.range(this.colors);

		return {left: leftStack, right: rightStack};
	}

});