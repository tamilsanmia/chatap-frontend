// src/WaterfallChart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const WaterfallChart1 = () => {
    const chartRef = useRef();

    useEffect(() => {
        drawChart();
    }, []);

    const drawChart = () => {
        // Sample data for the waterfall chart
        const data = [
            { name: "Start", value: 100 },
            { name: "Revenue", value: 150 },
            { name: "Costs", value: -50 },
            { name: "Profit", value: 80 },
            { name: "Taxes", value: -30 },
            { name: "End", value: 100 }
        ];
        const data1 = [
          { date: '2024-10-01', value: 100 },
          { date: '2024-10-02', value: 50 },
          { date: '2024-10-03', value: -30 },
          { date: '2024-10-04', value: 120 },
        ];
    
        // Parse date format for D3
        const parseDate = d3.timeParse('%Y-%m-%d');
        data.forEach((d) => {
          d.date = parseDate(d.date);
        });
        // Set up the chart dimensions and margins
        const margin = { top: 20, right: 20, bottom: 40, left: 50 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Select the SVG container and clear previous content if any
        const svg = d3.select(chartRef.current)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Calculate cumulative values for waterfall steps
        let cumulative = 0;
        data.forEach(d => {
            d.start = cumulative;
            cumulative += d.value;
            d.end = cumulative;
        });

        // Create scales
        const x = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.end)])
            .range([height, 0]);

        // Define gradient colors for positive and negative bars
        const defs = svg.append("defs");

        defs.append("linearGradient")
            .attr("id", "positive-gradient")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%")
            .html(`
                <stop offset="0%" stop-color="green" />
                <stop offset="100%" stop-color="lightgreen" />
            `);

        defs.append("linearGradient")
            .attr("id", "negative-gradient")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%")
            .html(`
                <stop offset="0%" stop-color="red" />
                <stop offset="100%" stop-color="pink" />
            `);

        // Draw the bars
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.name))
            .attr("y", d => y(Math.max(d.start, d.end)))
            .attr("height", d => Math.abs(y(d.start) - y(d.end)))
            .attr("width", x.bandwidth())
            .attr("fill", d => d.value >= 0 ? "url(#positive-gradient)" : "url(#negative-gradient)");

        // Add the x-axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Add the y-axis
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <svg ref={chartRef} width="100%" height="100%"></svg>
        </div>
    );
};

export default WaterfallChart1;
