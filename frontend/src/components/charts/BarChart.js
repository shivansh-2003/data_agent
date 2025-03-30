import React from 'react';

/**
 * Bar chart component
 * In a real application, this would use a charting library like Chart.js, D3, or Recharts
 */
const BarChart = ({ data }) => {
  if (!data || !data.labels || !data.datasets) {
    return <div className="text-center p-4">No chart data available</div>;
  }

  const { labels, datasets } = data;
  const maxValue = Math.max(...datasets.flatMap(dataset => dataset.data));
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-end">
        {labels.map((label, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            {datasets.map((dataset, datasetIndex) => {
              const value = dataset.data[index] || 0;
              const height = `${(value / maxValue) * 100}%`;
              
              return (
                <div
                  key={datasetIndex}
                  className="w-4/5 mb-1"
                  style={{
                    height,
                    backgroundColor: dataset.backgroundColor || `hsl(${datasetIndex * 60}, 70%, 60%)`,
                    marginTop: 'auto'
                  }}
                  title={`${label}: ${value}`}
                >
                  <div className="h-full w-full flex items-center justify-center text-xs text-white">
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-2 flex">
        {labels.map((label, index) => (
          <div key={index} className="flex-1 text-center text-xs truncate px-1">
            {label}
          </div>
        ))}
      </div>
      
      {datasets.length > 1 && (
        <div className="mt-4 flex justify-center">
          {datasets.map((dataset, index) => (
            <div key={index} className="flex items-center mx-2">
              <div
                className="w-4 h-4 mr-1"
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

export default BarChart;