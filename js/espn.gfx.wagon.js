d3.chart("wagon", {

	config : {
		colors : ["limegreen","orangered","white"],
		diameter : 150,
		padding : 10,
		textPadding : 35,
		labelAttr : {'fill':"#000", "font-size":"12px"},
		animDuration : 100,
		shadeColor : '#fff'
	},

	initialize: function(options) {

		var chart = this,
			diameter = options.diameter || chart.config.diameter,
			radius = diameter/2,
			padding = options.padding || chart.config.padding,
			textPadding = options.textPadding || chart.config.textPadding,
			labelAttr = options.labelAttr || chart.config.labelAttr,
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
				return d.data.max ? colors[1] : colors[0];
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
				.text(function(d) { return d.data.runs; });
		}

		function onTrans() {
			this.each(function(d,i){
				var g = d3.select(this);
				g.select('text')
					.text(function() { return d.data.runs; });
				g.select('path').style("fill", function(){
					return d.data.max ? colors[1] : colors[0];
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