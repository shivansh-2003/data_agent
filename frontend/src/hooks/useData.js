import { useContext } from 'react';
import DataContext from '../context/DataContext';

/**
 * Custom hook to access the data context
 * @returns {Object} - Data context value
 */
const useData = () => useContext(DataContext);

export default useData; 