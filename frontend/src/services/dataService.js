import { createApiClient, createFormSubmitter } from './api';

/**
 * Service for data-related API operations
 */
export class DataService {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.api = createApiClient(sessionId);
    this.formSubmitter = createFormSubmitter(sessionId);
  }

  /**
   * Upload a file for data processing
   * @param {File} file - The file to upload
   * @returns {Promise} - Upload response
   */
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.formSubmitter(`sessions/${this.sessionId}/data/upload`, formData);
  }

  /**
   * Process data from text input
   * @param {string} data - The data string
   * @param {string} format - Data format (csv, json, etc.)
   * @returns {Promise} - Processing response
   */
  async processTextData(data, format = 'csv') {
    const formData = new FormData();
    formData.append('data', data);
    formData.append('format', format);
    
    return this.formSubmitter(`sessions/${this.sessionId}/data/text`, formData);
  }

  /**
   * Get a preview of the loaded data
   * @param {number} rows - Number of rows to preview
   * @returns {Promise} - Data preview
   */
  async getDataPreview(rows = 10) {
    return this.api(`sessions/${this.sessionId}/data/preview?rows=${rows}`, {
      method: 'GET'
    });
  }

  /**
   * Get basic statistical analysis of the data
   * @returns {Promise} - Analysis results
   */
  async getBasicAnalysis() {
    return this.api(`sessions/${this.sessionId}/analyze/basic`, {
      method: 'POST'
    });
  }

  /**
   * Get correlation analysis for selected columns
   * @param {Array} columns - Columns to analyze (optional)
   * @returns {Promise} - Correlation analysis
   */
  async getCorrelationAnalysis(columns = null) {
    const endpoint = `sessions/${this.sessionId}/analyze/correlation`;
    const options = {
      method: 'POST'
    };
    
    if (columns) {
      options.body = JSON.stringify({ columns });
    }
    
    return this.api(endpoint, options);
  }

  /**
   * Get time series analysis
   * @param {string} timeColumn - Time column name
   * @param {string} valueColumn - Value column name
   * @param {string} frequency - Analysis frequency (day, month, etc.)
   * @returns {Promise} - Time series analysis
   */
  async getTimeSeriesAnalysis(timeColumn, valueColumn, frequency = 'month') {
    return this.api(`sessions/${this.sessionId}/analyze/timeseries`, {
      method: 'POST',
      body: JSON.stringify({
        time_column: timeColumn,
        value_column: valueColumn,
        frequency
      })
    });
  }

  /**
   * Generate a visualization
   * @param {string} vizType - Visualization type (bar, line, etc.)
   * @param {object} options - Visualization options
   * @returns {Promise} - Visualization response
   */
  async generateVisualization(vizType, options = {}) {
    const { xColumn, yColumn, groupBy, title } = options;
    
    return this.api(`sessions/${this.sessionId}/visualize`, {
      method: 'POST',
      body: JSON.stringify({
        viz_type: vizType,
        x_column: xColumn,
        y_column: yColumn,
        group_by: groupBy,
        title
      })
    });
  }
}

export default DataService; 