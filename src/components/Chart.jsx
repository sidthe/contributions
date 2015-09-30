let _ = require('lodash');
let React = require('react');

var parseDate = (month) => {
  return d3.time.format("%Y-%m").parse(month);
}

var getDistinctValues = (contributions) => {
  let distinct = _.values(contributions).reduce((memo, item) => {
    _.keys(item).forEach(memo.add.bind(memo));
    return memo;
  }, new Set());
  return [...distinct].sort();
};

var createChartData = (contributions) => {
  let distinctValues = getDistinctValues(contributions);
  let shifts = {};
  return Object.keys(contributions).map((user) => {
    return {
      label: user,
      values: distinctValues.map((date) => {
        let y0 = (shifts[date] || 0);
        let y1 = y0 + (contributions[user][date] || 0);
        shifts[date] = y1;
        return {
          date: parseDate(date),
          y0: y0,
          y: y1
        };
      })
    }
  });
};

var getXDomain = (contributions) => {
  let distinctValues = getDistinctValues(contributions);
  return [parseDate(distinctValues[0]), parseDate(distinctValues[distinctValues.length - 1])];
}


let options = {};

let d3 = require('d3');

class Chart extends React.Component {

  renderChart(contributions) {

    if (_.isEmpty(contributions)) {
      return ;
    }

    var margin = {top: 20, right: 20, bottom: 60, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    var x = d3.time.scale()
      .range([0, width]);

    var y = d3.scale.linear()
      .range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var area = d3.svg.area()
      .x(function (d) {
        return x(d.date);
      })
      .y0(function (d) {
        return y(0 + d.y0);
      })
      .y1(function (d) {
        return y(0 + d.y);
      });

    let color = d3.scale.category20();

    var chartData = {
      getXDomain() {
        let distinctValues = getDistinctValues(contributions);
        return [parseDate(distinctValues[0]), parseDate(distinctValues[distinctValues.length - 1])];
      },
      getYDomain() {
        return [0, 200];
      },
      getColor(name) {
        let rand = Math.floor(Math.random() * 20);
        return color(rand);
      },
      getAreaSeries() {
        return createChartData(contributions);
      }
    }

    var $container = this.refs.chartContainer.getDOMNode();

    var svg = d3.select($container).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(chartData.getXDomain());

    y.domain(chartData.getYDomain());

    var series = svg.selectAll(".series")
      .data(chartData.getAreaSeries())
      .enter().append("g")
      .attr("data-legend", function (d) {
        return d.name;
      })
      .attr("data-legend-color", function (d) {
        return chartData.getColor(d.name);
      })
      .attr("class", "series");

    series.append("path")
      .attr("class", "area")
      .attr("d", function (d) {
        return area(d.values);
      })
      .style("fill", function (d) {
        return chartData.getColor(d.name);
      });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis).selectAll("text")
      .attr("y", 10)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(30)")
      .style("text-anchor", "start");

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  }

  render() {
    return (
      <div ref="chartContainer">
        {this.renderChart(this.props.contributions)}
      </div>
    )
  }
}

module.exports = Chart;