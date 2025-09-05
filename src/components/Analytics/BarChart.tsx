import { useEffect, useRef } from 'react'
import * as d3 from "d3";

import '../../App.scss'

export default function BarChart({ data, colorPalette, metadata }) {
    type BarChartData = { category: string; value: number };
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!data || data.length === 0) return;
        const parsedData = parseData();
        paintBarChart(parsedData);
    }, [data]);

    const parseData = () => {
        // console.log("Bar Chart Data:", data);
        // parse data into an array where the first few columns are objects with the month as the group and then the total compensation per category, and then the last array index is a "columns" array of the category names
        const parsedData = data.reduce((acc, row) => {
            const dateObj = new Date(row.Date);
            const month = dateObj.toLocaleString('default', { month: 'long' });
            let monthEntry = acc.find(d => d.group === month);
            if (!monthEntry) {
                monthEntry = { group: month };
                acc.push(monthEntry);
            }
            const category = row.Category || 'Unknown';
            monthEntry[category] = (monthEntry[category] || 0) + (row.Compensation || 0) * (row.Quantity || 1);
            return acc;
        }, [] as any[]);
        parsedData.columns = Array.from(new Set(data.map(d => d.Category))).filter(c => c); // Get unique categories
        console.log("Parsed Data for Bar Chart:", parsedData)
        return parsedData;
    }

    const paintBarChart = (barChartData) => {
        // Remove previous chart
        d3.select(svgRef.current).selectAll('*').remove();

            // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 300, left: 50},
            width = 300 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select(svgRef.current)
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",`translate(${margin.left},${margin.top})`);

        // List of subgroups = header of the csv files = soil condition here
        const subgroups = barChartData.columns
        console.log("Subgroups:", subgroups);

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        const groups = barChartData.map(d => d.group)
        console.log("Groups:", groups);

        // Add X axis
        const x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add Y axis
        const y = d3.scaleLinear()
            // .domain([0, 60])
            .domain([0, d3.max(barChartData, (d: BarChartData) => {
                let total = 0;
                subgroups.forEach(subgroup => {
                    total += d[subgroup] || 0;
                });
                return total;
            })])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(colorPalette);

        //stack the data? --> stack per subgroup
        const stackedData = d3.stack()
            .keys(subgroups)
            (barChartData)

        // ----------------
        // Create a tooltip
        // ----------------
        const tooltip = d3.select("#my_dataviz")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function(event, d) {
            const subgroupName = d3.select(this.parentNode).datum().key;
            const subgroupValue = d.data[subgroupName];
            tooltip
                .html("subgroup: " + subgroupName + "<br>" + "Value: " + subgroupValue)
                .style("opacity", 1)

        }
        const mousemove = function(event, d) {
            tooltip.style("transform","translateY(-55%)")
                .style("left",(event.x)/2+"px")
                .style("top",(event.y)/2-30+"px")
        }
        const mouseleave = function(event, d) {
            tooltip
            .style("opacity", 0)
        }

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(d => d)
            .join("rect")
                .attr("x", d =>  x(d.data.group))
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width",x.bandwidth())
                .attr("stroke", "grey")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
        
    }
    
    return (
        <div className="barchart-container">
            <svg ref={svgRef}></svg>
        </div>
    )
}