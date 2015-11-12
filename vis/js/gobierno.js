function truncate(str, maxLength, suffix) {
	if(str.length > maxLength) {
		str = str.substring(0, maxLength + 1);
		str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
		str = str + suffix;
	}
	return str;
}

var margin = {top: 20, right: 200, bottom: 0, left: 20},
	width = 800,
	height = 650;

var start_year = 1977,
	end_year = 2015;

var c = d3.scale.category20c();

var x = d3.scale.linear()
	.range([0, width]);
x.ticks(20)

var xAxis = d3.svg.axis()
	.scale(x)
	.orient("top");

var formatYears = d3.format("0000");
xAxis.tickFormat(formatYears);

var svg = d3.select("#gobierno").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.style("margin-left", margin.left + "px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv('../data/gobierno.csv', function(gobierno){

  gobierno.forEach(function(d){
    switch(d.legislatura){
      case 'Constituyente': d.legislaturaN = 1; break;
      case 'Primera': d.legislaturaN = 2;break;
      case 'Segunda': d.legislaturaN = 3;break;
      case 'Tercera': d.legislaturaN = 4;break;
      case 'Cuarta': d.legislaturaN = 5;break;
      case 'Quinta': d.legislaturaN = 6;break;
      case 'Sexta': d.legislaturaN = 7;break;
      case 'Septima': d.legislaturaN = 8;break;
      case 'Octava': d.legislaturaN = 9;break;
      case 'Novena': d.legislaturaN = 10;break;
      case 'Decima': d.legislaturaN = 11;break;
      default: d.legislaturaN = 0;
    }
  })

  gobierno.forEach(function(d){ d.year = new Date(d.year.split('/').reverse().join("/")).getFullYear() })
  gobierno.forEach(function(d){ d.mujer = d.sexo=='Mujer' })

  var byLegislatura = d3.nest().key(d3.f('legislaturaN')).entries(gobierno);
  var byYear = d3.nest().key(d3.f('year')).entries(gobierno);

  byLegislatura.forEach(function (d){
    d.name=d.values[0].legislatura;
    total = 0
    periods = {}
    d.values.forEach(function (a) {
      if(!periods.hasOwnProperty(a.year)){
        periods[a.year]=0;
      }
      if(a.mujer){
        total++;
        periods[a.year]++;
      }
    })
    periods_ = [];
    for (p in periods){
      periods_.push([+p,periods[p]])
    }

    d.total = total;
    d.periods = periods_;
  });

data = byLegislatura;
x.domain([start_year, end_year]);
	var xScale = d3.scale.linear()
		.domain([start_year, end_year])
		.range([0, width])

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + 0 + ")")
		.call(xAxis);

	for (var j = 0; j < data.length; j++) {
		var g = svg.append("g").attr("class","journal");

		var circles = g.selectAll("rect")
			.data(data[j]['periods'])
			.enter()
			.append("rect");

		var text = g.selectAll("text")
			.data(data[j]['periods'])
			.enter()
			.append("text");

		var rScale = d3.scale.linear()
			.domain([0, d3.max(data[j]['periods'], function(d) { return d[1]; })])
			.range([2, 9]);

		circles
			.attr("x", function(d, i) { return xScale(d[0]); })
			.attr("y", j*20+20)
			.attr("width", function(d) { return rScale(d[1]); })
      .attr("height", function(d) { return rScale(d[1]); })
			.style("fill", function(d) { return c(j); })
      .on("mouseover",showTooltip);

		text
			.attr("y", j*20+25)
			.attr("x",function(d, i) { return xScale(d[0])-5; })
			.attr("class","value")
			.text(function(d){ return d[1]; })
			.style("fill", function(d) { return c(j); })
			.style("display","none");

		g.append("text")
			.attr("y", j*20+25)
			.attr("x",width+20)
			.attr("class","label")
			.text(truncate(data[j]['name'],30,"..."))
			.style("fill", function(d) { return c(j); })
			.on("mouseover", mouseover)
			.on("mouseout", mouseout);
	};

	function mouseover(p) {
		var g = d3.select(this).node().parentNode;
		d3.select(g).selectAll("rect").style("display","none");
		d3.select(g).selectAll("text.value").style("display","block");
	}

	function mouseout(p) {
		var g = d3.select(this).node().parentNode;
		d3.select(g).selectAll("rect").style("display","block");
		d3.select(g).selectAll("text.value").style("display","none");
	}
  function showTooltip(d){
    year = byYear.filter(function (y){return +y.key==d[0];});
    year = year.pop();
    mujeres = year.values.filter(function(m){return m.mujer});
    console.log(mujeres);
  }
});
