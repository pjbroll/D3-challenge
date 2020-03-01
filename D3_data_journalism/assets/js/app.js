// Set up our chart
//=================================
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 90,
  left: 90
};

// Set chart width
//=================================
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Set the svg wrapper
//=================================
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// append the group tag - shift left and down by left margin and top margin
//=================================
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
//=================================
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
//=================================
function xScale(acsData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenXAxis]) * 0.8,
        d3.max(acsData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

// function used for updating y-scale var upon click on axis label
//=================================
function yScale(acsData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(acsData, d => d[chosenYAxis]) * 0.8,
        d3.max(acsData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);

    return yLinearScale;
  
  }
    
  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
  // function used for updating circles group with a transition to
  // new circles along X axis
  function renderXCircles(circlesGroup, newXScale) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }

    // function used for updating circles group with a transition to
  // new circles along X axis
  function renderYCircles(circlesGroup, newYScale) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }
  
  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  
    if (chosenXAxis === "poverty") {
      var xLabel = "% in poverty:";
    }
    else if (chosenXAxis === "age") {
      var xLabel = "Median age:";
    }
    else {
        var xLabel = "Median income: $";
    }

    if (chosenYAxis === "healthcare") {
        var yLabel = "% no healthcare:";
      }
      else if (chosenYAxis === "smokes") {
        var yLabel = "% smokers:";
      }
      else {
          var yLabel = "% obese:";
      }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${yLabel} ${d[chosenYAxis]}<br>${xLabel} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }
  



// Import data from the data.csv file
//=================================
d3.csv("/assets/data/data.csv").then(function(acsData, err) {
  if (err) throw err;

    // number conversion
    acsData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obese = +data.obese;
    });

    // xLinearScale & yLinearScale function above csv import
    var xLinearScale = xScale(acsData, chosenXAxis);

    var yLinearScale = yScale(acsData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .style("font-size", "16px")
      .call(bottomAxis);

    // y axis
    var yAxis = chartGroup.append("g")
      .style("font-size", "16px")
      .call(leftAxis);

    // function for circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(acsData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 12)
        .attr("fill", "blue")
        .attr("opacity", ".6");

    // add State abbrev to circles
    chartGroup.selectAll("text.text-circles")
        .data(acsData)
        .enter()
        .append("text")
        .classed("text-circles",true)
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy",5)
        .attr("text-anchor","middle")
        .attr("font-size","12px")
        .attr("fill", "white");

    // Create group for  3 x- axis labels
    var labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty Rate (%)");

    var ageLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Median Age (Years)");

    var incomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Median Income ($)");

    // Create group for  3 y- axis labels
    var labelsYGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
        
        var healthCareLabel = labelsYGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)");

        var smokesLabel = labelsYGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 20 - margin.left)
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

        var obesityLabel = labelsYGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 40 - margin.left)
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsXGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(`X axis: ${chosenXAxis}`);

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(acsData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
        console.log(xAxis);
        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);   
        }
      }
    });

    // y axis labels event listener
    labelsYGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        console.log(`Y axis: ${chosenYAxis}`);

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(acsData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
        console.log(yAxis);
        // updates circles with new x values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "age") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthCareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthCareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthCareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);   
        }
      }
    });



}).catch(function(error) {
  console.log(error);
});