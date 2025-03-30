import React from 'react';
import { Box, Typography } from '@mui/material';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import styled from 'styled-components';

const ChartContainer = styled(Box)`
  height: 100%;
  min-height: 300px;
  width: 100%;
  padding: 16px;
`;

/**
 * Scatter plot component
 * In a real application, this would use a charting library like Chart.js, D3, or Recharts
 */
const ScatterPlot = ({ data }) => {
  if (!data || !data.labels || !data.datasets) {
    return <div className="text-center p-4">No chart data available</div>;
  }

  const { labels, datasets } = data;
  
  // Calculate value ranges for x and y axes
  const getAxisRange = (datasets, axis) => {
    const allValues = datasets.flatMap(dataset => 
      dataset.data.map(point => axis === 'x' ? point.x : point.y)
    );
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    return { min, max, range: max - min };
  };
  
  const xAxis = getAxisRange(datasets, 'x');
  const yAxis = getAxisRange(datasets, 'y');
  
  // Function to transform data point coordinates to SVG coordinates
  const transformPoint = (point) => {
    // Allow a small margin around the chart
    const margin = 30;
    const chartWidth = 300 - (margin * 2);
    const chartHeight = 200 - (margin * 2);
    
    // Normalize values between 0 and chart size
    const x = xAxis.range === 0 
      ? margin + (chartWidth / 2) 
      : margin + ((point.x - xAxis.min) / xAxis.range) * chartWidth;
      
    // Y-axis is inverted in SVG (0 at top)
    const y = yAxis.range === 0 
      ? margin + (chartHeight / 2) 
      : 200 - (margin + ((point.y - yAxis.min) / yAxis.range) * chartHeight);
      
    return { x, y };
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 300 200">
          {/* X and Y axes */}
          <line x1="30" y1="170" x2="270" y2="170" stroke="gray" strokeWidth="1" />
          <line x1="30" y1="30" x2="30" y2="170" stroke="gray" strokeWidth="1" />
          
          {/* Axis labels */}
          <text x="150" y="195" textAnchor="middle" fontSize="12">{data.xLabel || "X Axis"}</text>
          <text x="10" y="100" textAnchor="middle" fontSize="12" transform="rotate(-90, 10, 100)">{data.yLabel || "Y Axis"}</text>
          
          {/* X-axis ticks */}
          {[0, 25, 50, 75, 100].map(percent => {
            const value = xAxis.min + (percent / 100) * xAxis.range;
            const x = 30 + (percent / 100) * 240;
            return (
              <g key={`x-${percent}`}>
                <line x1={x} y1="170" x2={x} y2="175" stroke="gray" strokeWidth="1" />
                <text x={x} y="185" textAnchor="middle" fontSize="10">{Math.round(value * 100) / 100}</text>
              </g>
            );
          })}
          
          {/* Y-axis ticks */}
          {[0, 25, 50, 75, 100].map(percent => {
            const value = yAxis.min + (percent / 100) * yAxis.range;
            const y = 170 - (percent / 100) * 140;
            return (
              <g key={`y-${percent}`}>
                <line x1="25" y1={y} x2="30" y2={y} stroke="gray" strokeWidth="1" />
                <text x="20" y={y + 4} textAnchor="end" fontSize="10">{Math.round(value * 100) / 100}</text>
              </g>
            );
          })}
          
          {/* Grid lines */}
          {[25, 50, 75].map(percent => {
            const x = 30 + (percent / 100) * 240;
            const y = 170 - (percent / 100) * 140;
            return (
              <g key={`grid-${percent}`}>
                <line x1={x} y1="30" x2={x} y2="170" stroke="lightgray" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1={y} x2="270" y2={y} stroke="lightgray" strokeWidth="1" strokeDasharray="3,3" />
              </g>
            );
          })}
          
          {/* Data points */}
          {datasets.map((dataset, datasetIndex) => (
            <g key={datasetIndex}>
              {dataset.data.map((point, pointIndex) => {
                const { x, y } = transformPoint(point);
                const color = dataset.backgroundColor || `hsl(${datasetIndex * 60}, 70%, 60%)`;
                return (
                  <circle
                    key={pointIndex}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={color}
                    stroke="white"
                    strokeWidth="1"
                    opacity="0.7"
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      {datasets.length > 1 && (
        <div className="mt-4 flex justify-center">
          {datasets.map((dataset, index) => (
            <div key={index} className="flex items-center mx-2">
              <div
                className="w-4 h-4 mr-1 rounded-full"
                style={{ backgroundColor: dataset.backgroundColor || `hsl(${index * 60}, 70%, 60%)` }}
              ></div>
              <span className="text-xs">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScatterPlot;