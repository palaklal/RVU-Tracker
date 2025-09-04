import DonutChart from './DonutChart.tsx'
import LineChart from './LineChart.tsx'

import '../../App.scss'
import './analytics.scss'
import { useEffect, useState } from 'react';
import * as d3 from "d3";

const Analytics = ({ CSVObjects, setCSVObjects }) => {
    const colorPalette: string[] = [
            "#003d45", // main color
            "#388e3c", // green
            "#007c8a", // teal
            "#8d6e63",  // brown
            "#00b3b8", // light teal
            "#283593", // blue
            "#f9a825", // gold
            "#6a1b9a", // purple
            "#f57c00", // orange
            "#c62828", // red
        ];
    const categoryMetaData: any = { title: "Compensation by Category" };
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const RVUsOverTimeMetadata: any = { title: "Compensation Over Time", yLabel: "Compensation ($)", xLabel: "Date" };
    const [RVUsOverTimeData, setRVUsOverTimeData] = useState<any[]>([]);
    

    useEffect(() => {
        if (!CSVObjects || CSVObjects.length === 0) {
            setCategoryData([]);
            setRVUsOverTimeData([]);
            return;
        }

        setLineChartData()
        setDonutChartData()
    }, [CSVObjects]);

    const setDonutChartData = () => {
        // Count occurrences of each category
        const categoryCounts = CSVObjects.reduce((acc, row) => {
            const category = row.Category || 'Unknown';
            acc[category] = (acc[category] || 0) + row.Compensation * (row.Quantity || 1);
            return acc;
        }, {} as Record<string, number>);

        const donutChartData = Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count
        }));
        setCategoryData(donutChartData);
    }

    const setLineChartData = () => {
        const rvuOverTime = CSVObjects.reduce((acc, row) => {
            const date = row.Date ? new Date(row.Date).toISOString().split('T')[0] : 'Unknown';
            acc[date] = (acc[date] || 0) + (row.Compensation || 0) * (row.Quantity || 1);
            return acc;
        }, {} as Record<string, number>);

        const parseDate = d3.timeParse("%Y-%m-%d");

        const lineChartData = Object.entries(rvuOverTime)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, value]) => ({
            date: parseDate(date),
            value
            }));
        console.log("Line Chart Data:", lineChartData);
        setRVUsOverTimeData(lineChartData);
    }

    return (
        <div className="analytics-container">
            { categoryData.length > 0 && <DonutChart data={categoryData} colorPalette={colorPalette} metadata={categoryMetaData} />}
            { RVUsOverTimeData.length > 0 && <LineChart data={RVUsOverTimeData} colorPalette={colorPalette} metadata={RVUsOverTimeMetadata} />}
        </div>
    )
}

export default Analytics;