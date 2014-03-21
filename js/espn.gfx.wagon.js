"use strict";

d3.chart("wagon", {

	config : {
		colors : ["limegreen","orangered","white"],
		diameter : 150,
		padding : 0,
		textPadding : 35,
		labelAttr : {'fill':"#000", "font-size":"12px"},
		maxLabelColor : '#fff',
		animDuration : 100,
		shadeColor : '#fff',
		gradientDefId : "radialGradient",
		gradientColors : ["#7dcc5f","#74c24c"],
	},

	initialize: function(options) {

		var chart = this,
			diameter = options.diameter || chart.config.diameter,
			radius = diameter/2,
			padding = options.padding || chart.config.padding,
			textPadding = options.textPadding || chart.config.textPadding,
			labelAttr = options.labelAttr || chart.config.labelAttr,
			maxLabelColor = options.maxLabelColor || chart.config.maxLabelColor,
			gradientColors = options.gradientColors || chart.config.gradientColors,
			shade = options.shade,
			colors = (options.colors && options.colors.length == 3) ? options.colors : chart.config.colors;

		this.arc = d3.svg.arc()
			.outerRadius(radius - padding)
			.innerRadius(0);

		this.pie = d3.layout.pie()
			.sort(null)
			.value(function(d) { return 1; });

		this.base = this.base.append("svg");

		this.width(diameter);

		this.height(diameter);

		this.wrapper = this.base.append('g')
							.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

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

		if(shade){
			this.base.append('circle')
				.attr('cx', diameter / 2)
				.attr('cy', diameter / 2)
				.attr('r', (radius - textPadding/1.5))
				.attr('fill', chart.config.shadeColor)
				.attr('opacity', 0.2);
		}

		function onEnter() {
			this.append("path")
			.attr("d", chart.arc)
			.style("stroke", colors[2])
			.style("fill", function(d,i){
				return d.data.max ? colors[1] : "url(#" + chart.config.gradientDefId + ")";
			});

			this.append("text")
				.attr("transform", function(d) {
					var c = chart.arc.centroid(d),
						x = c[0],
						y = c[1],
						h = Math.sqrt(x*x + y*y);
					return "translate(" + (x/h * (radius - textPadding)) +  ',' + (y/h * (radius - textPadding)) +  ")";
				})
				.attr("dy", ".35em")
				.style("text-anchor", "middle")
				.attr(labelAttr)
				.attr('fill',function(d,i){
					// override fill color for the max zone
					return (d.data.max) ? maxLabelColor : labelAttr.fill;
				})
				.text(function(d) { return d.data.runs; });
		}

		function onTrans() {
			this.each(function(d,i){
				var g = d3.select(this);
				g.select('text')
					.text(function() { return d.data.runs; })
					.attr('fill',function(d,i){
						// override fill color
						return (d.data.max) ? maxLabelColor : labelAttr.fill;
					});
				g.select('path')
					.style("fill",chart.config.gradientColors[0])
					.transition(chart.config.animDuration)
					.style("fill", function(d,i){
						return d.data.max ? colors[1] : "url(#" + chart.config.gradientDefId + ")";
					});
			});
		}

		function dataBind(data) {
			return chart.wrapper.selectAll(".arc")
				.data(chart.pie(data));
		}

		function insert() {
			return this.append('g').attr("class", "arc");
		}

		var wagon = this.layer("wagon", this.wrapper, {
		  dataBind: dataBind,
		  insert: insert
		});

		wagon.on("enter", onEnter);
		wagon.on("update:transition", onTrans);

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