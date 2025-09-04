import { useEffect, useRef } from 'react'
import * as d3 from "d3";

import '../../App.scss'

export default function LineChart({ data, colorPalette, metadata }) {
    type LineChartData = { date: string; value: number };
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!data || data.length === 0) return;

        // set the dimensions and margins of the graph
        const margin = {top: 100, right: 250, bottom: 50, left: 50},
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom

        // Remove previous chart
        d3.select(svgRef.current).selectAll('*').remove();

        // append the svg object to the body of the page
        const svg = d3.select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add X axis
        const x = d3.scaleTime()
            .domain(d3.extent(data, (d: LineChartData) => d.date))
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        // Add X axis label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("fill", "#006064")
            .text(metadata.xLabel);

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, (d: LineChartData) => +d.value)])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add Y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")           
            .attr("y", -40)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("fill", "#006064")
            .text(metadata.yLabel);

        // Add individual data points
        svg.append("g")
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
                .attr("cx", (d: LineChartData) => x(d.date) )
                .attr("cy", (d: LineChartData) => y(d.value) )
                .attr("r", 3)
                .attr("fill", colorPalette[0])
        //add tooltip on hover
            .on("mouseover", (event: MouseEvent, d: LineChartData) => {
                const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("position", "absolute")
                    .style("background", "#003d45")
                    .style("padding", "5px")
                    .style("border", "1px solid #d4d4d4")
                    .style("border-radius", "5px")
                    .style("pointer-events", "none")
                    .style("font-size", "10px")
                    .html(`<strong>Date:</strong> ${d3.timeFormat("%Y-%m-%d")(d.date)}<br/><strong>Total Compensation:</strong> $${d.value.toFixed(2)}`);
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                d3.selectAll(".tooltip").remove();
            });

        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", colorPalette[1])
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x((d: LineChartData) => x(d.date) )
                .y((d: LineChartData) => y(d.value) )
            )

        // Add box shadow to the SVG
        svg.style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))');
        // Add chart title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .attr('font-weight', 'bold')
            .attr('fill', '#003d45')
            .text(metadata.title);

    }, [data, colorPalette]);

    return (
        <svg ref={svgRef}></svg>
    );
}
