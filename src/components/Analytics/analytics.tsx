import DonutChart from './DonutChart.tsx'

import '../../App.scss'
import './analytics.scss'
import { useEffect, useState } from 'react';

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
    const [categoryData, setCategoryData] = useState<any[]>([]);
    

    useEffect(() => {
        if (!CSVObjects || CSVObjects.length === 0) {
            setCategoryData([]);
            return;
        }
        // TODO: Update chart data whenever CSVObjects change
        
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

    return (
        <div className="analytics-container">
            { categoryData.length > 0 && <DonutChart data={categoryData} colorPalette={colorPalette} />}
        </div>
    )
}

export default Analytics;