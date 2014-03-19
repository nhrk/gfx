d3.chart("heatmap", {

	config : {
		labelAttr : {"font-size": "12px", 'text-anchor': 'start', 'style': 'color:white'},
		gridSize : 3,
		strokeColor : '#fff',
		textColor : '#fff',
		wicketColor : "#f9901d",
		colorRange : ["#9bdf81","#85de63", "#7dcc5f","#62af44"]
	},

	initialize: function(options) {

		options = options || {};

		var chart = this,
			labelAttr = options.labelAttr || this.config.labelAttr,
			squareSize,
			textColor = options.textColor || chart.config.textColor;
			wicketColor = options.wicketColor || chart.config.wicketColor;
			colorRange = options.colorRange || this.config.colorRange;;

		this.base = this.base.append("svg");

		this.width(options.width || 200);

		this.height(this.width());

		squareSize = this.width() / chart.config.gridSize;

		this.base
			.attr("class", "chart");

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
		  			return (pos.column * squareSize) - squareSize;
		  		})
				.attr("y", function(d,i) { 
					var pos = getGridPosition(i+1);
					return (pos.row * squareSize) - squareSize;
				})
				.attr('stroke', chart.config.strokeColor)
				.attr('fill',function(d,i){
					return (d.wickets) ? wicketColor : chart.colorScale(d.runs);
				})
				.attr("width", squareSize)
				.attr("height", function(d,i){
						return squareSize;
				})
				.each(function(d,i){
					var bbox,
						text = d3.select(this.parentNode)
								.append('text')
									.text(function(){
										return d.runs + (d.wickets ? '(' + d.wickets + 'w)' : '');
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
							return (pos.column * squareSize) - (squareSize/2) - (bbox.width/2);
						})
						.attr('dy',function() { 
							var pos = getGridPosition(i+1);
							return (pos.row * squareSize) - (squareSize/2) + (bbox.height/2);
						});
				});
		}

		function onTrans() {
			this.each(function(d,i){
				var bbox,
					text = d3.select(this.parentNode).select('text')
						.text(function() {
							return d.runs + (d.wickets ? '(' + d.wickets + 'w)' : '');
						});

					bbox = text[0][0].getBBox();

					text.attr('dx',function(){
						var pos = getGridPosition(i+1);
						return (pos.column * squareSize) - (squareSize/2) - (bbox.width/2);
					});

				d3.select(this).attr('fill',function(d,i){
					return (d.wickets) ? wicketColor : chart.colorScale(d.runs);
				});
			});
		}

		function dataBind(data) {
		  return this.selectAll("rect")
			.data(data, function(d) { return d.zone; });
		}

		function insert() {
		  return this.append('g').insert("rect", "line");
		}

		var zones = this.layer("zones", this.base, {
		  dataBind: dataBind,
		  insert: insert
		});

		zones.on("enter", onEnter);
		zones.on("update:transition", onTrans);

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