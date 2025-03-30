import React from 'react';

/**
 * Pie chart component
 * In a real application, this would use a charting library like Chart.js, D3, or Recharts
 */
const PieChart = ({ data }) => {
  if (!data || !data.labels || !data.datasets || !data.datasets[0]) {
    return <div className="text-center p-4">No chart data available</div>;
  }

  const { labels, datasets } = data;
  const dataset = datasets[0]; // Pie charts typically have one dataset
  
  // Calculate the total for percentages
  const total = dataset.data.reduce((sum, value) => sum + value, 0);
  
  // Calculate segments of the pie
  const segments = dataset.data.map((value, index) => {
    const percentage = total === 0 ? 0 : (value / total) * 100;
    return {
      value,
      percentage,
      label: labels[index],
      color: dataset.backgroundColor?.[index] || `hsl(${index * 40}, 70%, 60%)`
    };
  });
  
  // Calculate the SVG paths for pie segments
  const createPieSegments = () => {
    const cx = 150; // Center x
    const cy = 150; // Center y
    const radius = 100;
    let startAngle = 0;
    
    return segments.map((segment, index) => {
      // If value is 0, don't draw a segment
      if (segment.value === 0) return null;
      
      // Calculate angles in radians
      const angle = (segment.percentage / 100) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      
      // Calculate points on the circle
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      
      // Create path (larger-arc-flag is 0 for angles < 180°, 1 for angles >= 180°)
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      const path = `M ${cx},${cy} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
      
      const result = (
        <path
          key={index}
          d={path}
          fill={segment.color}
          stroke="white"
          strokeWidth="2"
        />
      );
      
      // Update start angle for next segment
      startAngle = endAngle;
      
      return result;
    });
  };
  
  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex-1 flex items-center justify-center">
        <svg width="300" height="300" viewBox="0 0 300 300">
          {createPieSegments()}
        </svg>
      </div>
      
      <div className="mt-4 flex flex-wrap justify-center">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center mx-2 mb-2">
            <div
              className="w-4 h-4 mr-1"
              style={{ backgroundColor: segment.color }}
            ></div>
            <span className="text-xs">
              {segment.label}: {segment.value} ({Math.round(segment.percentage)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;