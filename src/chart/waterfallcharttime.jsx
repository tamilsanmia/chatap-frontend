import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import "./Waterfallcss.css"
const WaterfallChart2 = ({ data, stockName, ltp }) => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 60, right: 20, bottom: 60, left: 20 }; // Adjusted bottom margin
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous chart on re-render
    d3.select(svgRef.current).selectAll('*').remove();

    // const svg = d3
    // .select(svgRef.current)
    // .attr('width', width + margin.left + margin.right)
    // .attr('height', height + margin.top + margin.bottom)
    // .append('g')
    // .attr('transform', `translate(${margin.left},${margin.top})`);

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  
      svg.append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("x", -margin.left)
      .attr("y", -margin.top)
      .style("fill", "#0b0e11"); 
      // .style("fill", "#181a20");  // Change to your preferred background color

    // Parse and sort data chronologically
    const parseDate = d3.timeParse('%Y-%m-%d');
    const formattedData = data.map(d => ({
      // date: parseDate(d.date),
      date: new Date(d.date),
      value: d.value,
    }));
    formattedData.sort((a, b) => a.date - b.date);
   

    // Calculate cumulative waterfalls
    let cumulative = 0;
    const waterfallData = formattedData.map(d => {
    
      const prevCumulative = cumulative;
      cumulative += d.value;
   
      return { ...d, cumulative, prevCumulative };
    });
    
    // Define scales
    const x = d3
      .scaleBand()
    
      .domain(formattedData.map(d => new Date(d.date)))
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
      .style('fill', '#848e9c')
      .call(
        d3.axisBottom(x)
          .tickValues(
            formattedData
              .map(d => d.date)
              .filter((_, i) => i % 4 === 0)
          )
          .tickFormat(d3.timeFormat('%b %d'))

      );

    // Rotate x-axis labels
    xAxis.selectAll('text')
      .attr('transform', 'rotate(-95)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em')
      .style('fill', '#848e9c');

    // Y Axis
    // svg.append('g')
    //   .call(d3.axisLeft(y).ticks(10))
    //   .style('fill', '#848e9c');



    // Draw bars
    svg.selectAll('.bar')
      .data(waterfallData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.date) - x(new Date(formattedData[0].date)) / formattedData.length / 2) // Center bars x(d.date))
      .attr('y', d => y(Math.max(d.prevCumulative, d.cumulative)))
      .attr('height', d => Math.abs(y(d.prevCumulative) - y(d.cumulative)))
      .attr('width', (width / formattedData.length) * 0.8)//x.bandwidth())
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

        // POSITIVE BREAK
        const lastTwoPositiveSum =
        (waterfallData[i - 1]?.value ?  Math.abs(waterfallData[i - 1]?.value)*1.2: 0)
        +
        (waterfallData[i]?.value ? Math.abs(d.value)*1.2: 0);

      const lastThreeNegativeSum =
        (waterfallData[i - 5]?.value? Math.abs(Math.abs(waterfallData[i - 2]?.value) - Math.abs(waterfallData[i - 1]?.value)): 0)
         +
        (waterfallData[i - 4]?.value? Math.abs(Math.abs(waterfallData[i - 3]?.value) - Math.abs(waterfallData[i - 2]?.value)): 0)
         +
        (waterfallData[i - 3]?.value? Math.abs(Math.abs(waterfallData[i - 4]?.value) - Math.abs(waterfallData[i - 3]?.value)): 0)
        // console.log(lastThreeNegativeSum," + ",lastTwoPositiveSum)
        // Check the second condition
        if (lastTwoPositiveSum > lastThreeNegativeSum) {
       
          // Add up-arrow below the respective bar
          // svg.append('text')
          // .attr('x', x(d.date) + x.bandwidth() / 2) // Center the arrow under the bar
          // .attr('y', y(d.cumulative) + 30) // Slightly above the bar top
          // .attr('text-anchor', 'middle')
          // .attr('font-size', '20px')
          // .attr('fill', 'green')
          // .text('▲'); // Up-arrow symbol

          // Add a green oval with blur below the bar
          svg.append('ellipse')
            .attr('cx', x(d.date) + x.bandwidth() / 2) // Center the oval below the bar
            .attr('cy', y(d.cumulative)) // Slightly below the bar
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
   
      // console.log(d.value)
      if (
        i >= 5 && // Ensure there are enough bars to check
        waterfallData[i - 5].value > 0 &&
        waterfallData[i - 4].value > 0 &&
        waterfallData[i - 3].value > 0 &&
        waterfallData[i - 2].value > 0 &&
        waterfallData[i - 1].value > 0 &&
        d.value < 0 // Current value is negative

      ) {
        // console.log("-")
        svg.append('text')
          .attr('x', x(d.date) + x.bandwidth() / 2) // Center the arrow under the bar
          .attr('y', y(d.cumulative) - 10) // Slightly above the bar top
          .attr('text-anchor', 'middle')
          .attr('font-size', '55px')
          .attr('fill', 'purple')
          .text('.'); // Up-arrow symbol


        // Calculate the last 2 positive and last 3 negative sums
        const lastTwoPositiveSum =
          ((waterfallData[i - 2]?.value) ? Math.abs((waterfallData[i - 2]?.value - waterfallData[i - 1]?.value)) : 0) +
          ((waterfallData[i - 1]?.value) ? Math.abs((waterfallData[i - 1]?.value - d.value) ): 0);

        const lastThreeNegativeSum =

          (waterfallData[i - 5]?.value ? Math.abs((waterfallData[i - 3]?.value - waterfallData[i - 4]?.value)) : 0) +
          (waterfallData[i - 4]?.value ? Math.abs((waterfallData[i - 4]?.value - waterfallData[i - 5]?.value) ): 0)+ 
          (waterfallData[i - 3]?.value ? Math.abs((waterfallData[i - 5]?.value - waterfallData[i - 6]?.value) ): 0);
    // console.log(lastThreeNegativeSum," - ",lastTwoPositiveSum)
        // Check the second condition
        if (lastTwoPositiveSum > lastThreeNegativeSum) {

          // // Add up-arrow below the respective bar
          // svg.append('text')
          // .attr('x', x(d.date) + x.bandwidth() / 2) // Center the arrow under the bar
          // .attr('y', y(d.cumulative) + 20) // Slightly above the bar top
          // .attr('text-anchor', 'middle')
          // .attr('font-size', '20px')
          // .attr('fill', 'gray')
          // .text('▼'); // Up-arrow symbol

          svg.append('ellipse')
            .attr('cx', x(d.date) + x.bandwidth() / 2) // Center the oval below the bar
            .attr('cy', y(d.cumulative)) // Slightly below the bar
            .attr('rx', 15) // Horizontal radius
            .attr('ry', 8) // Vertical radius
            .attr('fill', 'red')
            .style('filter', 'blur(8px)'); // Add blur effect
        }
      }
    });

    // Add Stock Name and LTP
    svg.append('text')
      .attr('x', width *0.2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text(`${stockName } : ${ ltp}`)
      .style('fill', '#FCD535');

      const lastData = waterfallData[waterfallData.length - 1];

      if (lastData) {
        const lastCircle = svg
          .append("circle")
          .attr("cx", x(lastData.date) + x.bandwidth() / 2)
          .attr("cy", y(lastData.cumulative))
          .attr("r", 3)
          .attr("fill", "yellow")
          .attr("opacity", 0.4);
  
        function animateBlinking() {
          lastCircle
            .transition()
            .duration(500)
            .attr("r", 8)
            .attr("opacity", 0.2)
            .transition()
            .duration(500)
            .attr("r", 5)
            .attr("opacity", 0.4)
            .on("end", animateBlinking);
        }
  
        animateBlinking();
      }

  }, [data, stockName, ltp]);

  return (

          <svg ref={svgRef} ></svg>

  );
};

export default WaterfallChart2;