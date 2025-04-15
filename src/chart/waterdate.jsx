// WaterfallChart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import "./Waterfallcss.css"

const WaterfallChart2 = ({ data, stockName, ltp }) => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 60, right: 30, bottom: 80, left: 50 }; // Adjusted bottom margin
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous chart on re-render
    d3.select(svgRef.current).selectAll('*').remove();

    // const svg = d3
    //   .select(svgRef.current)
    //   .attr('width', width + margin.left + margin.right)
    //   .attr('height', height + margin.top + margin.bottom)
    //   .append('g')
    //   .attr('transform', `translate(${margin.left},${margin.top})`);

      const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse and sort data chronologically
    const parseDate = d3.timeParse('%Y-%m-%d');
    const formattedData = data.map(d => ({
      date: parseDate(d.date),
      value: d.value,
    }));
    formattedData.sort((a, b) => a.date - b.date);

    // Calculate cumulative values
    let cumulative = 0;
    const waterfallData = formattedData.map(d => {
      const prevCumulative = cumulative;
      cumulative += d.value;
      return { ...d, cumulative, prevCumulative };
    });

    // Define scales
    const x = d3
      .scaleBand()
      .domain(formattedData.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(waterfallData, d => Math.min(d.prevCumulative, d.cumulative)),
        d3.max(waterfallData, d => Math.max(d.prevCumulative, d.cumulative)),
      ])
      .nice()
      .range([height, 0]);

    // X Axis
    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .style('fill','#848e9c')
      .call(
        d3.axisBottom(x)
          .tickValues(
            formattedData
              .map(d => d.date)
              .filter((_, i) => i % 3 === 0)
          )
          .tickFormat(d3.timeFormat('%b %d'))
          
      );

    // Rotate x-axis labels
    xAxis.selectAll('text')
      .attr('transform', 'rotate(-95)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em')
      .style('fill','#848e9c');

    // Y Axis


    // Draw bars
    svg.selectAll('.bar')
      .data(waterfallData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.date))
      .attr('y', d => y(Math.max(d.prevCumulative, d.cumulative)))
      .attr('height', d => Math.abs(y(d.prevCumulative) - y(d.cumulative)))
      .attr('width', x.bandwidth())
      .attr('fill', d =>
        d.cumulative === d3.max(waterfallData, d => d.cumulative)
          ? 'blue'
          : d.cumulative === d3.min(waterfallData, d => d.cumulative)
          ? 'orange'
          : d.value >= 0
          ? '#0ECB81'
          : '#F6465D'
      );

    // Check for the condition: last 4 negative, next positive, and sum conditions
    waterfallData.forEach((d, i) => {
      if (
        i >= 4 && // Ensure there are enough bars to check
        waterfallData[i - 4].value < 0 &&
        waterfallData[i - 3].value < 0 &&
        waterfallData[i - 2].value < 0 &&
        waterfallData[i - 1].value < 0 &&
        d.value > 0 // Current value is positive
      ) {

        svg.append('text')
        .attr('x', x(d.date) + x.bandwidth() / 2) // Center the arrow under the bar
        .attr('y', y(d.cumulative) + 15) // Slightly above the bar top
        .attr('text-anchor', 'middle')
        .attr('font-size', '55px')
        .attr('fill', 'blue')
        .text('.'); // Up-arrow symbol

        console.log(
          waterfallData[i - 6]?.value-waterfallData[i - 5]?.value+
          waterfallData[i - 5]?.value-waterfallData[i - 4]?.value+
          waterfallData[i - 4]?.value-waterfallData[i - 3]?.value,
          waterfallData[i - 3]?.value-waterfallData[i - 2]?.value,
          waterfallData[i - 2]?.value-waterfallData[i - 1]?.value)

        // Calculate the last 2 positive and last 3 negative sums
        const lastTwoPositiveSum = 
          ((waterfallData[i - 2]?.value ) ? (waterfallData[i - 3]?.value-waterfallData[i - 2]?.value) :0)  +
          ((waterfallData[i -1]?.value ) ? (waterfallData[i - 2]?.value-waterfallData[i - 1]?.value) :0 );

        const lastThreeNegativeSum = 
          (waterfallData[i - 5]?.value  ? (waterfallData[i - 4]?.value-waterfallData[i - 3]?.value) : 0) +
          (waterfallData[i - 4]?.value  ? (waterfallData[i - 5]?.value-waterfallData[i - 4]?.value) : 0) +
          (waterfallData[i - 3]?.value  ? (waterfallData[i - 6]?.value-waterfallData[i - 5]?.value) : 0);
console.log(lastThreeNegativeSum,"  + ",lastTwoPositiveSum)
        // Check the second condition
        if (lastTwoPositiveSum > lastThreeNegativeSum) {
          console.log("+")
          // Add up-arrow below the respective bar
          // svg.append('text')
          //   .attr('x', x(d.date) + x.bandwidth() / 2) // Center the arrow under the bar
          //   .attr('y', y(d.cumulative) + 30) // Slightly above the bar top
          //   .attr('text-anchor', 'middle')
          //   .attr('font-size', '20px')
          //   .attr('fill', 'green')
          //   .text('▲'); // Up-arrow symbol

                  // Add a green oval with blur below the bar
        svg.append('ellipse')
        .attr('cx', x(d.date) + x.bandwidth() / 2) // Center the oval below the bar
        .attr('cy', y(d.cumulative)  ) // Slightly below the bar
        .attr('rx', 15) // Horizontal radius
        .attr('ry', 8) // Vertical radius
        .attr('fill', 'green')
        .style('filter', 'blur(6px)'); // Add blur effect
        }
      }
    });

    //Negative

    // Check for the condition: last 4 negative, next positive, and sum conditions
    waterfallData.forEach((d, i) => {
      if (
        i >= 4 && // Ensure there are enough bars to check
        waterfallData[i - 4].value > 0 &&
        waterfallData[i - 3].value > 0 &&
        waterfallData[i - 2].value > 0 &&
        waterfallData[i - 1].value > 0 &&
        d.value < 0 // Current value is positive
      ) {

        svg.append('text')
        .attr('x', x(d.date) + x.bandwidth() / 2) // Center the arrow under the bar
        .attr('y', y(d.cumulative) - 10) // Slightly above the bar top
        .attr('text-anchor', 'middle')
        .attr('font-size', '55px')
        .attr('fill', 'purple')
        .text('.'); // Up-arrow symbol


        // Calculate the last 2 positive and last 3 negative sums
        const lastTwoPositiveSum = 
          ((waterfallData[i - 2]?.value ) ? (waterfallData[i - 3]?.value-waterfallData[i - 2]?.value) :0)  /
          ((waterfallData[i -1]?.value ) ? (waterfallData[i - 2]?.value-waterfallData[i - 1]?.value) :0 );

        const lastThreeNegativeSum = 
          (waterfallData[i - 5]?.value  ? (waterfallData[i - 4]?.value-waterfallData[i - 3]?.value) : 0) +
          (waterfallData[i - 4]?.value  ? (waterfallData[i - 5]?.value-waterfallData[i - 4]?.value) : 0) +
          (waterfallData[i - 3]?.value  ? (waterfallData[i - 6]?.value-waterfallData[i - 5]?.value) : 0);

        // Check the second condition
        if (lastTwoPositiveSum < lastThreeNegativeSum) {
          
          // // Add up-arrow below the respective bar
          // svg.append('text')
          //   .attr('x', x(d.date) + x.bandwidth() / 2) // Center the arrow under the bar
          //   .attr('y', y(d.cumulative) + 20) // Slightly above the bar top
          //   .attr('text-anchor', 'middle')
          //   .attr('font-size', '20px')
          //   .attr('fill', 'gray')
          //   .text('▼'); // Up-arrow symbol
          
          svg.append('ellipse')
            .attr('cx', x(d.date) + x.bandwidth() / 2) // Center the oval below the bar
            .attr('cy', y(d.cumulative)  ) // Slightly below the bar
            .attr('rx', 15) // Horizontal radius
            .attr('ry', 8) // Vertical radius
            .attr('fill', 'red')
            .style('filter', 'blur(8px)'); // Add blur effect
        }
      }
    });

    // Add Stock Name and LTP
    svg.append('text')
      .attr('x', width /2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '28px')
      .style('font-weight', 'bold')
      .text(`${stockName} : ${ltp}`)
      .style('fill','#FCD535');

  }, [data, stockName, ltp]);

  return (
    <div className="ChartContainer">
      <div className="row">
        <div className="col-12">
          <svg ref={svgRef} className="w-100"></svg>
        </div>
      </div>
    </div>
  );
};

export default WaterfallChart2;
