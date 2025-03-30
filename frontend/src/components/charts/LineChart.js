import React from 'react';

/**
 * Line chart component
 * In a real application, this would use a charting library like Chart.js, D3, or Recharts
 */
const LineChart = ({ data }) => {
  if (!data || !data.labels || !data.datasets) {
    return <div className="text-center p-4">No chart data available</div>;
  }

  const { labels, datasets } = data;
  const maxValue = Math.max(...datasets.flatMap(dataset => dataset.data));
  const minValue = Math.min(...datasets.flatMap(dataset => dataset.data));
  const range = maxValue - minValue;
  
  // Function to create SVG path for line
  const createLinePath = (dataset) => {
    const points = dataset.data.map((value, index) => {
      const x = `${(index / (labels.length - 1)) * 100}%`;
      // Normalize values between 0 and 100%
      const normalizedValue = range === 0 ? 50 : ((value - minValue) / range) * 100;
      const y = `${100 - normalizedValue}%`;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="border-t border-gray-200 dark:border-gray-700 w-full"
            ></div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute inset-y-0 left-0 w-10 flex flex-col justify-between text-xs text-gray-500">
          {[...Array(5)].map((_, i) => {
            const value = maxValue - (i * (range / 4));
            return (
              <div key={i} className="pl-1">
                {Math.round(value * 100) / 100}
              </div>
            );
          })}
        </div>
        
        {/* Chart area */}
        <div className="absolute inset-0 ml-10">
          <svg className="w-full h-full">
            {/* Lines */}
            {datasets.map((dataset, index) => (
              <g key={index}>
                <path
                  d={createLinePath(dataset)}
                  fill="none"
                  stroke={dataset.borderColor || `hsl(${index * 60}, 70%, 60%)`}
                  strokeWidth="2"
                />
                {/* Data points */}
                {dataset.data.map((value, pointIndex) => {
                  const x = `${(pointIndex / (labels.length - 1)) * 100}%`;
                  const normalizedValue = range === 0 ? 50 : ((value - minValue) / range) * 100;
                  const y = `${100 - normalizedValue}%`;
                  return (
                    <circle
                      key={pointIndex}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={dataset.pointBackgroundColor || dataset.borderColor || `hsl(${index * 60}, 70%, 60%)`}
                      stroke="white"
                      strokeWidth="1"
                    />
                  );
                })}
              </g>
            ))}
          </svg>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="mt-2 flex pl-10">
        {labels.map((label, index) => (
          <div 
            key={index} 
            className="flex-1 text-center text-xs truncate"
            style={{ 
              maxWidth: `${100 / labels.length}%` 
            }}
          >
            {label}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      {datasets.length > 1 && (
        <div className="mt-4 flex justify-center">
          {datasets.map((dataset, index) => (
            <div key={index} className="flex items-center mx-2">
              <div
                className="w-4 h-4 mr-1"
                style={{ backgroundColor: dataset.borderColor || `hsl(${index * 60}, 70%, 60%)` }}
              ></div>
              <span className="text-xs">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LineChart;