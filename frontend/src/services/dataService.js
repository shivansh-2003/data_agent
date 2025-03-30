import { createApiClient, createFormSubmitter } from './api';
import API_ENDPOINTS from '../constants/apiEndpoints';

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
   * @param {Function} onProgress - Optional progress callback
   * @returns {Promise} - Upload response
   */
  async uploadFile(file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    
    const options = {};
    
    // Add progress tracking if callback provided
    if (onProgress && typeof onProgress === 'function') {
      options.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted, progressEvent);
      };
    }
    
    return this.formSubmitter(API_ENDPOINTS.UPLOAD_FILE(this.sessionId), formData, options);
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
    
    return this.formSubmitter(API_ENDPOINTS.UPLOAD_TEXT(this.sessionId), formData);
  }

  /**
   * Get a preview of the loaded data
   * @param {number} rows - Number of rows to preview
   * @returns {Promise} - Data preview
   */
  async getDataPreview(rows = 10) {
    return this.api(`${API_ENDPOINTS.DATA_PREVIEW(this.sessionId)}?rows=${rows}`, {
      method: 'GET'
    });
  }

  /**
   * Get basic statistical analysis of the data
   * @returns {Promise} - Analysis results
   */
  async getBasicAnalysis() {
    return this.api(API_ENDPOINTS.BASIC_ANALYSIS(this.sessionId), {
      method: 'POST'
    });
  }

  /**
   * Get correlation analysis for selected columns
   * @param {Array} columns - Columns to analyze (optional)
   * @returns {Promise} - Correlation analysis
   */
  async getCorrelationAnalysis(columns = null) {
    const endpoint = API_ENDPOINTS.CORRELATION_ANALYSIS(this.sessionId);
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
    return this.api(API_ENDPOINTS.TIMESERIES_ANALYSIS(this.sessionId), {
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
    
    return this.api(API_ENDPOINTS.VISUALIZE(this.sessionId), {
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
  
  /**
   * Export data to specified format
   * @param {string} format - Export format (csv, excel, json)
   * @param {object} options - Export options
   * @returns {Promise} - Exported data
   */
  async exportData(format = 'csv', options = {}) {
    const endpoint = `${API_ENDPOINTS.DATA_PREVIEW(this.sessionId)}/export`;
    
    return this.api(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        format,
        ...options
      }),
      responseType: 'blob' // To handle binary responses
    });
  }
}

export default DataService;