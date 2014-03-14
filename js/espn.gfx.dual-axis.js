d3.chart("dual-axis", {

	config : {
		barSpacing : -7,
		barWidth : 13,
		colors : ['orangered','steelblue'],
		runsClass : 'bars1',
		ballsClass : 'bars2',
		xScaleValue : 'overs',
		y2RightPadding : 0,
		y2TickSize: -10,
		bottomMargin : 18,
		xBottomPadding : 0,
		leftMargin : 25,
		rightMargin : 18,
		xLeftPadding : 5
	},

	initialize: function(options) {

		var chart = this,
			colors = options.colors || chart.config.colors,
			barWidth = options.barWidth || chart.config.barWidth,
			barSpacing = options.barSpacing || chart.config.barSpacing,
			leftMargin = options.leftMargin || chart.config.leftMargin,
			rightMargin = options.rightMargin || chart.config.rightMargin,
			y2TickSize = options.y2TickSize || chart.config.y2TickSize,
			y2RightPadding = options.y2RightPadding || chart.config.y2RightPadding,
			xBottomPadding = options.xBottomPadding || chart.config.xBottomPadding,
			xLeftPadding = options.xLeftPadding || chart.config.xLeftPadding,
			bottomMargin = options.bottomMargin || chart.config.bottomMargin;

		this.base = this.base.append("svg");

		this.width(options.width || 400);

		this.height(options.height || 250);

		this.base.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + (-barWidth/2 + xLeftPadding) + "," + (this.height() - bottomMargin + xBottomPadding) + ")");

		this.base.append("g")
			.attr("class", "y axis axisLeft")
			.attr("transform", "translate(" + leftMargin + ",0)");

		this.base.append("g")
			.attr("class", "y axis axisRight")
			.attr("transform", "translate(" + (this.width() - rightMargin + y2RightPadding) + ",0)");

		this.x = d3.scale.ordinal()
					.rangeRoundBands([0, this.width()], .1);

		this.y0 = d3.scale.linear()
					.range([this.height() - bottomMargin, 0]);

		this.y1 = d3.scale.linear()
					.range([this.height() - bottomMargin, 0]);

		this.xAxis = d3.svg.axis()
			.scale(this.x)
			.orient("bottom");			

		this.yAxisLeft = d3.svg.axis()
							.scale(this.y0)
							.ticks(4)
							.orient("left");

		this.yAxisRight = d3.svg.axis()
							.scale(this.y1)
							.ticks(4)
							.tickSize(y2TickSize)
							.orient("right");

		options = options || {};

		/* 1st Y axis */

		function onEnterY0() {

			this.attr("x", function(d) { return chart.x(d.spell); })
				.attr("width", barWidth)
				.attr('style', function(){
					return 'fill:' + colors[0];
				})
				.attr("y", function(d) { return chart.y0(d.runs); })
				.attr("height", function(d,i,j) { return chart.height() - bottomMargin - chart.y0(d.runs); }); 
		}

		function onTransY0() {
			this.attr("height", function(d,i,j) { return chart.height() - bottomMargin - chart.y0(d.runs); })
				.attr("y", function(d) { return chart.y0(d.runs); })
		}

		function dataBindY0(data) {
			console.log(data);
		  return this.selectAll("." + chart.config.runsClass + " rect").data(data,function(d,i){
		  	console.log(d.spell);
		  	return d.spell;
		  });
		}

		function insertY0() {
			return this.insert("rect");
		}

		var runs = this.layer(chart.config.runsClass, this.base.append("g").attr("class", chart.config.runsClass).attr("transform", "translate(" + leftMargin/2 + ",0)"), {
		  dataBind: dataBindY0,
		  insert: insertY0
		});

		runs.on("enter", onEnterY0);
		runs.on("update:transition", onTransY0);

		/* 2nd Y axis */

		function onEnterY1(){
			this.attr("x", function(d) { return chart.x(d.spell) + chart.x.rangeBand()/2 + barSpacing; })
				.attr("width", barWidth)
				.attr('style', function(){
					return 'fill:' + colors[1];
				})
				.attr("y", function(d) { return chart.y1(d.balls); })
				.attr("height", function(d,i,j) { return chart.height() - bottomMargin - chart.y1(d.balls); }); 
		}

		function onTransY1(){
			this.attr("height", function(d,i,j) { return chart.height() - bottomMargin - chart.y1(d.balls); })
				.attr("y", function(d) { return chart.y1(d.balls); })
		}

		function dataBindY1(data){
		  	return this.selectAll("." + chart.config.ballsClass + " rect").data(data,function(d,i){
			  	return d.spell;
			  });
		  }

		function insertY1(){
			return this.insert("rect");
		}

		var balls = this.layer(chart.config.ballsClass, this.base.append("g").attr("class", chart.config.ballsClass).attr("transform", "translate(" + leftMargin/2 + ",0)"), {
			dataBind: dataBindY1,
			insert: insertY1
		});

		balls.on("enter", onEnterY1);
		balls.on("update:transition", onTransY1);

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
		// Restrict to 5 spells (top 5)
		if(dataSrc.length > 5){
			dataSrc = dataSrc.slice(0,5);
		}
		this.x.domain(dataSrc.map(function(d) { return d.spell; }));
  		this.y0.domain([0, d3.max(dataSrc, function(d) { return d.runs; })]);
  		this.y1.domain([0, d3.max(dataSrc, function(d) { return d.balls; })]);
  		
  		/* Added custom function */
  		this.onTransform(dataSrc);
		return dataSrc;
	},

	onTransform: function(dataSrc){

		var chart = this;

		/* Update x-axis ticks */
		this.xAxis
			.tickFormat(function(d,i){
				return (dataSrc[i] && dataSrc[i].overs) || '';
			});

		/* Rescale/update axes on data update */
		this.base.select('.x.axis')
			.call(this.xAxis);

		this.base.select('.y.axisLeft')
			.call(this.yAxisLeft);

		this.base.select('.y.axisRight')
			.call(this.yAxisRight);
	}

});