function truncate(str, maxLength, suffix) {
	if(str.length > maxLength) {
		str = str.substring(0, maxLength + 1);
		str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
		str = str + suffix;
	}
	return str;
}

var margin = {top: 20, right: 100, bottom: 0, left: 20},
	width = 1020,
	height = 350;

var start_year = 1977,
	end_year = 2015;

var c = d3.scale.category20c();
var c2 = function(x){
	var range = colorbrewer.RdYlGn[4];
	return range[Math.round(x/(100/range.length))]};

var x = d3.scale.linear().range([0, width]);

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

d3.csv('../../datasets/gobierno.csv', function(gobierno){

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
        periods[a.year]=[0,0];
      }
      if(a.mujer){
        total++;
        periods[a.year][0]++;
      }
			periods[a.year][1]++;
    })
    periods_ = [];
    for (p in periods){
			p_ = +parseFloat((periods[p][0]/periods[p][1])*100).toFixed(0)
      periods_.push([+p,p_,periods[p][0],periods[p][1]-periods[p][0],d.name])
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

		var squares = g.selectAll("rect")
			.data(data[j]['periods'])
			.enter()
			.append("rect");

		var text = g.selectAll("text")
			.data(data[j]['periods'])
			.enter()
			.append("text");

		var rScale = d3.scale.linear()
			.domain([0, d3.max(data[j]['periods'], function(d) { return d[1]; })])
			.range([2, 12]);

		squares
			.attr("x", function(d, i) { return xScale(d[0]); })
			.attr("y", j*20+20)
			.attr("width", function(d) { return rScale(d[1]); })
      .attr("height", function(d) { return rScale(d[1]); })
			.style("fill", function(d) {return c2(d[1])})
			.call(d3.attachTooltip)
			.on("mouseover",showTooltip);

		text
			.attr("y", j*20+25)
			.attr("x",function(d, i) { return xScale(d[0])-5; })
			.attr("class","value")
			.text(function(d){ return d[1]+"%"; })
			.style("fill", function(d) {return c2(d[1])})
			.style("display","none");

		g.append("text")
			.attr("y", j*20+25)
			.attr("x",width+20)
			.attr("class","label")
			.text(truncate(data[j]['name'],30,"..."))
			.style("fill", function(d) { return c(1); })
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
		template = _.template("<strong><%=nombre%></strong> - <%= cargo %>")
    year = byYear.filter(function (y){return +y.key==d[0];});
    year = year.pop();
    mujeres = year.values.filter(function(m){return m.mujer});
		text = "<span class='right'>"+d[0]+"</span><strong> Legislatura:</strong> "+d[4]+"<br>";
		text +="<strong> Mujeres:</strong> "+d[1]+"%<p>";
		mujeres.forEach(function(m){
			text+=template(m)+"<br>";
		})
		text+="</p>"
		d3.select('.tooltip').html(text)
  }
});
