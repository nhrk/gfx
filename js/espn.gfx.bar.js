'use strict';

d3.chart('bar', {

	config : {
		barHeight : 12,
		colors : ['#f8911b','#fff'],
		animDuration : 750,
		barPosY : 25,
		textPaddingLeft : 12,
		labelPaddingTop : 30,
		textPosX : 1,
		textPosY : 15,
		barClass : 'barClass',
		linearGradient : 'linearGradient',
		labelAttr : {'font-size': '14px', 'text-anchor': 'start', 'font-style': 'italic'},
		valAttr : {'font-size': '16px', 'font-weight':'bold'},
		markerClass : 'markerClass',
		gradientId : 'linearGradient'
	},

	initialize: function(options) {

		options = options || {};

		var chart = this,
			labelAttr = options.labelAttr || this.config.labelAttr,
			valAttr = options.valAttr || this.config.valAttr,
			textPosY = options.textPosY || this.config.textPosY,
			textPosX = options.textPosX || this.config.textPosX,
			hideLabel = (!options.hideLabel),
			colorMeter = options.colorMeter,
			colors = options.colors || this.config.colors;

		chart.barPosY = options.barPosY || this.config.barPosY;

		chart.barHeight = options.barHeight || this.config.barHeight;

		this.base = this.base.append('svg');

		this.width(options.width || 200);

		this.height(options.height || 80);

		this.showMarker = (!!options.marker);

		if(colorMeter){
			this.base.append('rect').attr('class',chart.config.linearGradient);
			this.generateGradient();
		}

		this.wrapper = this.base.append('g');

		if(hideLabel){
			this.label = chart.base.append('text')
				.text(options.title || 'Percentage')
				.attr('dx',textPosX)
				.attr('dy',textPosY)
				.attr(labelAttr);
		}

		function onEnter() {

		  var length = this.chart().length;

		  this.attr('x', function(d,i){ return (i == 0) ? 0 : chart.width() - chart.width() * d.percent / 100; })
				.attr('y', chart.barPosY)
				.attr('width', function(d,i){ return chart.width() * d.percent / 100 })
				.attr('height', chart.barHeight)
				.attr('fill',function(d,i){
					if(colorMeter && i ===0){
						return 'transparent';
					}else if(colorMeter && i ===1){
						return colors[1];
					}
					return ((i===0) ? colors[0] : colors[1]);
				})
				.each(function(d,i){

					var parent = d3.select(this.parentNode);

					if(hideLabel && i === 0){
						parent
						.append('text')
							.text(function(){ return d.percent; })
							.attr('dx',function(){
								var bbox = chart.label[0][0].getBBox();
								return bbox.width + chart.config.textPaddingLeft;
							})
							.attr('dy',textPosY)
							.attr(valAttr)
							.attr('text-anchor','start');
					}

					if(chart.showMarker && i === 1){
						parent.append('path')
								.attr('class',chart.config.markerClass)
								.attr('d',d3.svg.symbol().type('triangle-up'))
								.attr('transform','translate(' + (chart.width() - chart.width() * d.percent / 100) + ',' + (chart.barPosY + 4) + '),scale(0.7,0.7)');
					}
				});
		}

		function onTrans() {

			this.duration(chart.config.animDuration)
				.attr('x', function(d, i) { 
					if(i == 0) return 0;
					var x = chart.width() - chart.width() * d.percent / 100;
					return  x;
				})
				.attr('width',function(d,i){ return chart.width() * d.percent / 100 });

			this.each(function(d,i){

				d3.select(this.parentNode).select('text')
					.text(function(){ return d.percent; });

				chart.base.select('.' + chart.config.markerClass).transition(350)
					.attr('transform','translate(' + (chart.width() - chart.width() * d.percent / 100) + ',' + (chart.barPosY + 4) + '),scale(0.7,0.7)');
			})	

		}

		function dataBind(data) {
		  return this.selectAll('rect')
			.data(data, function(d) { return d.label; });
		}

		function insert() {
		  return this.append('g').insert('rect', 'line');
		}

		var bars = this.layer('bars', this.wrapper, {
		  dataBind: dataBind,
		  insert: insert
		});

		bars.on('enter', onEnter);
		bars.on('update:transition', onTrans);

	},

	generateGradient: function(){

		this.gradient = this.base.append('svg:defs')
			.append('svg:linearGradient')
			.attr('id', this.config.gradientId)
			.attr('x1', '0%')
			.attr('y1', '0%')
			.attr('x2', '100%')
			.attr('y2', '0%')
			.attr('spreadMethod', 'pad');

		this.gradient.append('svg:stop')
			.attr('offset', '0%')
			.attr('stop-color', 'rgb(255,0,0)')
			.attr('stop-opacity', 1);

		this.gradient.append('svg:stop')
			.attr('offset', '70%')
			.attr('stop-color', 'rgb(255,255,0)')
			.attr('stop-opacity', 1);

		this.gradient.append('svg:stop')
			.attr('offset', '100%')
			.attr('stop-color', 'green')
			.attr('stop-opacity', 1);

		this.base
			.select('.' + this.config.linearGradient)
			.attr('y',this.barPosY)
			.attr('height',this.barHeight)
			.attr('width',this.width())
			.style('fill', 'url(#' + this.config.gradientId + ')');
	},

	width: function(newWidth) {
		if (!arguments.length) {
			return this._width;
		}
		this._width = newWidth;
		this.base.attr('width', this._width);
		return this;
	},

	height: function(newHeight) {
		if (!arguments.length) {
			return this._height;
		}
		this._height = newHeight;
		this.base.attr('height', this._height);
		return this;
	},

	transform: function(value) {

		value = (typeof value === 'number') ? value : Number(value);

		if(isNaN(value)){
			throw new Error('Invalid data! Input is not a number');
		}

		return [{percent : value, label : '+'}, {percent : (100 - value), label : '-'}];
	}

});