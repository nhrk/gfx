d3.chart("bar", {

	config : {
		barHeight : 12,
		colors : ['#faa304' , '#8a89a6'],
		animDuration : 750,
		top : 25,
		textPaddingLeft : 12,
		labelPaddingTop : 30,
		textPosX : 1,
		textPosY : 15,
		labelAttr : {"font-size": "14px", 'text-anchor': 'start', 'font-style': 'italic'},
		valAttr : {"font-size": "16px", 'font-weight':'bold'}
	},

	initialize: function(options) {

		/*
			TODO: Set min/max dimensions for the graph
			...
		 */

		options = options || {};

		var chart = this,
			barHeight = options.barHeight || this.config.barHeight,
			labelAttr = options.labelAttr || this.config.labelAttr,
			valAttr = options.valAttr || this.config.valAttr,
			textPosY = options.textPosY || this.config.textPosY,
			textPosX = options.textPosX || this.config.textPosX,
			colors = options.colors || this.config.colors;

		this.base = this.base.append("svg");

		this.width(options.width || 200);

		this.height(options.height || 80);

		this.base
			.attr("class", "chart");

		this.label = chart.base.append('text')
				.text(options.title || "Percentage")
				.attr('dx',textPosX)
				.attr('dy',textPosY)
				.attr(labelAttr);

		if(options.colors && options.colors.length === 2){
			this.config.colors = options.colors;
		}

		function onEnter() {

		  var length = this.chart().length;

		  this.attr("x", function(d,i){ return (i == 0) ? 0 : chart.width() - chart.width() * d.percent / 100; })
				.attr("y", function(d) { return chart.config.top; })
				.attr("width", function(d,i){ return chart.width() * d.percent / 100 })
				.attr("height", barHeight)
				.attr("style",function(d,i){
					return 'fill:' +  ((i==0) ? colors[0] : colors[1]);
				})
				.each(function(d,i){
					if(i === 0){
						d3.select(this.parentNode)
						.append('text')
							.text(function(){ return d.percent; })
							.attr('dx',function(){
								/* TODO: Check */
								var bbox = chart.label[0][0].getBBox();
								return bbox.width + chart.config.textPaddingLeft;
							})
							.attr('dy',textPosY)
							.attr(valAttr)
							.attr("text-anchor",'start');
					}
				});
		}

		function onTrans() {

			this.each(function(d,i){
				d3.select(this.parentNode).select('text')
					.text(function(){ return d.percent; });
			})

			this.duration(chart.config.animDuration)
				.attr("x", function(d, i) { 
					if(i == 0) return 0;
					var x = chart.width() - chart.width() * d.percent / 100;
					return  x;
				})
				.attr("width",function(d,i){ return chart.width() * d.percent / 100 })

		}

		function dataBind(data) {
		  return this.selectAll("rect")
			.data(data, function(d) { return d.label; });
		}

		function insert() {
		  return this.append('g').insert("rect", "line");
		}

		var bars = this.layer("bars", this.base.append("g"), {
		  dataBind: dataBind,
		  insert: insert
		});

		bars.on("enter", onEnter);
		bars.on("update:transition", onTrans);

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

	transform: function(value) {

		/* TODO: type checks */
		var value = value,
			diff = 100 - value;

		return [{percent : value, label : '+'}, {percent : diff, label : '-'}];
	}

});