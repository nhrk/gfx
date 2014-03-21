"use strict";

d3.chart("spikes", {

	config : {
		diameter : 150,
		maxLabelColor : '#fff',
		shadeColor : '#fff',
		gradientDefId : "radialGradient",
		gradientColors : ["#7dcc5f","#74c24c"],
		colorMap : {
			"1" : "#8a17a7",
			"2" : "#642c01",
			"3" : "#f0d900",
			"4" : "#e0e0e0",
			"5" : "#034466",
			"6" : "#fa280c"
		},
		offset : 10,
		strokeWidth : 2,
		spikesClass : 'spikesClass'
	},

	initialize: function(options) {

		var chart = this,
			diameter = options.diameter || chart.config.diameter,
			radius = diameter/2,
			gradientColors = options.gradientColors || chart.config.gradientColors,
			shade = options.shade,
			offset = options.offset || chart.config.offset,
			colorMap = options.colorMap || chart.config.colorMap;

		this.base = this.base.append("svg");

		this.width(diameter);

		this.height(diameter);

		this.center = diameter / 2;

		this.ground = this.base.append('circle')
			.attr('cx', this.center)
			.attr('cy', this.center)
			.attr('r', radius)
			.attr('fill', "url(#" + chart.config.gradientDefId + ")");

		this.wrapper = this.base.append('g');

		this.gradient = this.base.append("defs")
							.append("radialGradient")
							.attr("id", chart.config.gradientDefId)
							.attr("r", "65%");

		this.gradient.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", chart.config.gradientColors[0])
			.attr("stop-opacity", "1");

		this.gradient.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", chart.config.gradientColors[1])
			.attr("stop-opacity", "1");

		this.base.append('circle')
			.attr('cx', diameter / 2)
			.attr('cy', diameter / 2)
			.attr('r', radius/2)
			.attr('fill', chart.config.shadeColor)
			.attr('opacity', 0.2);

		function onEnter() {

			this.attr('x1',chart.center)
				.attr('y1',chart.center - offset)
				.attr('x2',function(d,i){
					return d.x;
				})
				.attr('y2',function(d,i){
					return d.y;
				})
				.attr('stroke-width',chart.config.strokeWidth)
				.attr('stroke',function(d,i){
					return colorMap[d.runs] || '#fff';
				}).on('mouseover',function(d,i){
					var bbox = this.getBBox();
					console.log('comms:',d.comms,'x:',bbox.x,'y:',bbox.y,'runs:',d.runs);
				});
		}

		function onTrans() {
			
			this.attr('x2',function(d,i){
					return d.x;
				})
				.attr('y2',function(d,i){
					return d.y;
				})
				.attr('stroke',function(d,i){
					return colorMap[d.runs] || '#fff';
				});
		}

		function dataBind(data) {
			return chart.wrapper.selectAll("." + chart.config.spikesClass)
				.data(data);
		}

		function insert() {
			return this.append('line').attr("class",chart.config.spikesClass);
		}

		var spikes = this.layer("spikes", this.wrapper, {
		  dataBind: dataBind,
		  insert: insert
		});

		spikes.on("enter", onEnter);
		spikes.on("update:transition", onTrans);

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
		return dataSrc;
	}
});