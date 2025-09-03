import { useEffect, useRef } from 'react'
import * as d3 from "d3";

import '../../App.scss'

export default function DonutChart({ data, colorPalette, metadata }) {
    type DonutChartData = { category: string; count: number };
    const chartRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        console.log("DonutChart data:", data);
        if (!data || data.length === 0) return;
    
        // Chart dimensions
        const width = 400;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 40;

        // Remove previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.category))
            .range(colorPalette);

        // Pie generator
        const pie = d3.pie<DonutChartData>()
            .value((d: DonutChartData) => d.count)
            .sort(null);

        // Arc generator
        const arc = d3.arc<d3.PieArcDatum<DonutChartData>>()
            .innerRadius(radius * 0.33)
            .outerRadius(radius);

        // Draw slices
        svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.category))
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        // Add labels
        svg.selectAll('text')
            .data(pie(data))
            .enter()
            .append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('font-size', 11)
            .attr('fill', '#fff')
            .text(d => d.data.category)
            .attr('dy', '-0.5em');
        svg.selectAll('text.value')
            .data(pie(data))
            .enter()
            .append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('font-size', 11)
            .attr('fill', '#fff')
            .attr('dy', '0.8em')
            .text(d => `$${d.data.count.toFixed(2)}`);
        
        // Add box shadow to the SVG
        d3.select(chartRef.current).select('svg')
            .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))');
        // Add title
        svg.append('text')
            .attr('x', 0)
            .attr('y', -height / 2 + 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .attr('font-weight', 'bold')
            .attr('fill', '#003d45')
            .text(metadata.title);
    }, [data]);
    return (
        <div ref={chartRef}></div>
    )

}