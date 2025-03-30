/**
 * Application configuration settings
 */

const config = {
    // API configuration
    api: {
      baseUrl: 'https://data-agent-ww7e.onrender.com',
      timeout: 30000, // 30 seconds
    },
    
    // Authentication settings
    auth: {
      tokenKey: 'data_analyst_auth_token',
      userKey: 'data_analyst_user',
      sessionTimeout: 3600000, // 1 hour in milliseconds
    },
    
    // Feature flags
    features: {
      enableRealtimeUpdates: false,
      enableCustomVisualizations: true,
      enableExportFeatures: true,
      debugMode: false,
    },
    
    // File upload settings
    upload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      acceptedFileTypes: {
        'text/csv': ['.csv'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
        'text/plain': ['.txt'],
        'application/json': ['.json'],
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png']
      }
    },
    
    // Default visualization settings
    visualizations: {
      defaultColors: [
        '#4475dd', '#ff6c80', '#44c1ab', '#fcbe2c', '#8c76f9',
        '#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236'
      ],
      chartHeight: 400,
    }
  };
  
  export default config;