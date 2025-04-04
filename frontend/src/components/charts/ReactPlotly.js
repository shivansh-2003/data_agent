import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * React component for rendering Plotly visualizations
 * This component handles both raw Plotly div HTML and direct Plotly data
 */
const ReactPlotly = ({ 
  data = null,
  layout = null,
  config = {},
  htmlContent = null,
  height = 400,
  width = '100%',
  onRender = null
}) => {
  const plotContainer = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default Plotly config for better interactivity
  const defaultConfig = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: 'data_visualization',
      height: 500,
      width: 700,
      scale: 2
    }
  };
  
  // Merge default config with passed config
  const plotlyConfig = { ...defaultConfig, ...config };
  
  useEffect(() => {
    let plot = null;
    
    const renderPlotly = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (htmlContent) {
          // If raw HTML content is provided (from backend response)
          if (plotContainer.current) {
            // Clear any existing content
            plotContainer.current.innerHTML = '';
            
            // Insert the HTML content
            plotContainer.current.innerHTML = htmlContent;
            
            // Find the Plotly div and force responsive behavior
            const plotlyDivs = plotContainer.current.querySelectorAll('.js-plotly-plot');
            if (plotlyDivs.length > 0) {
              plotlyDivs.forEach(div => {
                div.style.width = '100%';
                div.style.height = `${height}px`;
                
                // Try to force responsive behavior by calling Plotly.Plots.resize
                const gd = div;
                if (gd._fullLayout) {
                  Plotly.Plots.resize(gd);
                }
              });
            }
          }
        } else if (data && layout) {
          // If Plotly data and layout are provided directly
          if (plotContainer.current) {
            // Clear any existing content
            plotContainer.current.innerHTML = '';
            
            // Create new plot with the data and layout
            plot = await Plotly.newPlot(
              plotContainer.current,
              data,
              { ...layout, height, width },
              plotlyConfig
            );
          }
        } else {
          setError('No visualization data provided');
        }
        
        // Call onRender callback if provided
        if (onRender && typeof onRender === 'function') {
          onRender();
        }
      } catch (err) {
        console.error('Error rendering Plotly visualization:', err);
        setError('Failed to render visualization');
      } finally {
        setIsLoading(false);
      }
    };
    
    renderPlotly();
    
    return () => {
      // Clean up if needed
      if (plot && plotContainer.current) {
        Plotly.purge(plotContainer.current);
      }
    };
  }, [data, layout, htmlContent, height, width, plotlyConfig, onRender]);
  
  // Add window resize handler to make plot responsive
  useEffect(() => {
    const handleResize = () => {
      if (plotContainer.current) {
        Plotly.Plots.resize(plotContainer.current);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: `${height}px` }}>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
          }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      <div
        ref={plotContainer}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
};

export default ReactPlotly;