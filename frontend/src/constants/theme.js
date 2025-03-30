/**
 * Application theme constants
 */

export const COLORS = {
  // Primary palette
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff'
  },
  
  // Secondary palette
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff'
  },
  
  // Success, warning, error, info
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff'
  },
  
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff'
  },
  
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff'
  },
  
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff'
  },
  
  // Gray palette
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },
  
  // Light and dark mode backgrounds
  background: {
    light: '#ffffff',
    dark: '#121212',
    paper: {
      light: '#ffffff',
      dark: '#1e1e1e'
    },
    default: {
      light: '#f5f5f5',
      dark: '#121212'
    }
  },
  
  // Text colors
  text: {
    light: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)'
    },
    dark: {
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.6)',
      disabled: 'rgba(255, 255, 255, 0.38)'
    }
  }
};

// Typography settings
export const TYPOGRAPHY = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: 16,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  
  // Font size variants
  h1: {
    fontSize: '2.5rem',
    fontWeight: 300,
    lineHeight: 1.2
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 300,
    lineHeight: 1.2
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 400,
    lineHeight: 1.2
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 400,
    lineHeight: 1.2
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 400,
    lineHeight: 1.2
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.2
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: 'uppercase'
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66
  }
};

// Spacing multiplier (in px)
export const SPACING = 8;

// Border radius
export const BORDER_RADIUS = {
  small: '4px',
  medium: '8px',
  large: '12px',
  round: '50%'
};

// Shadows
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};

// Breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
};

// Z-index values
export const Z_INDEX = {
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  BREAKPOINTS,
  Z_INDEX
}; 