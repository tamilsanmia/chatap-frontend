import * as d3 from "d3";
import React, { useEffect, useRef } from "react";

const CandlestickChart = ({ data, stockName }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length < 2) return;

        const width = 800;  
        const height = 450; 
        const margin = { top: 20, right: 50, bottom: 50, left: 60 };

        d3.select(svgRef.current).selectAll("*").remove(); // Clear previous chart

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const chart = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Convert date strings to Date objects
        const parsedData = data.map(d => ({
            ...d,
            date: new Date(d.date),
        }));

        // Calculate Moving Averages
        const calculateMovingAverage = (data, period) => {
            return data.map((d, i, arr) => {
                if (i < period - 1) return { ...d, ma: null };
                const avg = d3.mean(arr.slice(i - period + 1, i + 1), d => d.close);
                return { ...d, ma: avg };
            });
        };

        const dataWithMA7 = calculateMovingAverage(parsedData, 7);
        const dataWithMA14 = calculateMovingAverage(parsedData, 14);

        // X-Axis: Scale based on Date
        const xScale = d3.scaleTime()
            .domain(d3.extent(parsedData, d => d.date))
            .range([0, chartWidth]);

        // Y-Axis: Scale based on min/max prices
        const yScale = d3.scaleLinear()
            .domain([
                d3.min(parsedData, d => d.low) * 0.98,
                d3.max(parsedData, d => d.high) * 1.02
            ])
            .range([chartHeight, 0]);

        // X-Axis Renderer
        const xAxis = d3.axisBottom(xScale)
            .ticks(6)
            .tickFormat(d3.timeFormat("%b %d, %H:%M"));

        chart.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("fill", "#c5c5c5");

        // Y-Axis Renderer
        chart.append("g")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("fill", "#c5c5c5");

        // Adjust candle width
        const candleWidth = chartWidth / parsedData.length * 0.8;

        // Draw Candlesticks
        chart.selectAll(".candle")
            .data(parsedData)
            .enter()
            .append("rect")
            .attr("class", "candle")
            .attr("x", d => xScale(d.date) - candleWidth / 2)
            .attr("y", d => yScale(Math.max(d.open, d.close)))
            .attr("height", d => Math.abs(yScale(d.open) - yScale(d.close)))
            .attr("width", candleWidth)
            .attr("fill", d => (d.close >= d.open ? "#26a69a" : "#ef5350"));

        // Draw Wicks
        chart.selectAll(".wick")
            .data(parsedData)
            .enter()
            .append("line")
            .attr("class", "wick")
            .attr("x1", d => xScale(d.date))
            .attr("x2", d => xScale(d.date))
            .attr("y1", d => yScale(d.high))
            .attr("y2", d => yScale(d.low))
            .attr("stroke", d => (d.close >= d.open ? "#26a69a" : "#ef5350"))
            .attr("stroke-width", 1.5);

        // Moving Average 7 (Green Line)
        const line7 = d3.line()
            .defined(d => d.ma !== null)
            .x(d => xScale(d.date))
            .y(d => yScale(d.ma))
            .curve(d3.curveMonotoneX);

        chart.append("path")
            .datum(dataWithMA7)
            .attr("fill", "none")
            .attr("stroke", "#4caf50")
            .attr("stroke-width", 2)
            .attr("d", line7);

        // Moving Average 14 (Red Line)
        const line14 = d3.line()
            .defined(d => d.ma !== null)
            .x(d => xScale(d.date))
            .y(d => yScale(d.ma))
            .curve(d3.curveMonotoneX);

        chart.append("path")
            .datum(dataWithMA14)
            .attr("fill", "none")
            .attr("stroke", "#e53935")
            .attr("stroke-width", 2)
            .attr("d", line14);

        // Buy/Sell Signals based on MA crossovers
        dataWithMA7.forEach((d, i) => {
            if (i > 0 && dataWithMA7[i - 1].ma !== null && dataWithMA14[i - 1].ma !== null) {
                const prevMA7 = dataWithMA7[i - 1].ma;
                const prevMA14 = dataWithMA14[i - 1].ma;
                const currentMA7 = d.ma;
                const currentMA14 = dataWithMA14[i].ma;

                if (prevMA7 < prevMA14 && currentMA7 > currentMA14) {
                    // BUY Signal (Green Dot)
                    chart.append("circle")
                        .attr("cx", xScale(d.date))
                        .attr("cy", yScale(d.close))
                        .attr("r", 5)
                        .attr("fill", "#00ff00");
                }

                if (prevMA7 > prevMA14 && currentMA7 < currentMA14) {
                    // SELL Signal (Red Dot)
                    chart.append("circle")
                        .attr("cx", xScale(d.date))
                        .attr("cy", yScale(d.close))
                        .attr("r", 5)
                        .attr("fill", "#ff0000");
                }
            }
        });

    }, [data]);

    return (
        <div className="p-4 bg-[#181a20] rounded-xl shadow-lg">
            <h4 className="text-white text-lg font-bold">{stockName}</h4>
            <svg ref={svgRef} />
        </div>
    );
};

export default CandlestickChart;
