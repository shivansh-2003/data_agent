# Data Analyst AI Frontend

This directory contains the React frontend for the Data Analyst AI project.

## Structure

```
frontend/
├── public/                  # Static assets and HTML template
│   ├── favicon.ico         # Website favicon
│   ├── index.html          # HTML template
│   ├── manifest.json       # Web app manifest
│   └── assets/             # Static assets (images, fonts, etc.)
│       ├── images/         # Image assets
│       │   └── placeholder.png
│       └── fonts/          # Font files
│           └── README.md
├── src/                    # Source code
│   ├── App.js              # Enhanced main application component
│   ├── index.js            # Application entry point
│   ├── index.css           # Global styles with animations and accessibility features
│   ├── config.js           # Global configuration settings with API URL
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Common UI elements
│   │   │   ├── Button.js                 # Custom button component
│   │   │   ├── Card.js                   # Card component
│   │   │   ├── Modal.js                  # Modal dialog component
│   │   │   ├── Loader.js                 # Loading indicator
│   │   │   ├── AccessibilityHelper.js    # Accessibility features component
│   │   │   ├── ApiErrorHandler.js        # API error handling component
│   │   │   ├── DataRefreshControl.js     # Data refresh control component
│   │   │   ├── FileUploadProgress.js     # File upload progress component
│   │   │   ├── LoadingAnimation.js       # Enhanced loading animation
│   │   │   ├── ParticlesBackground.js    # Animated particles background
│   │   │   ├── ProtectedRoute.js         # Route protection component
│   │   │   └── UpdatesNotification.js    # Updates notification component
│   │   ├── layout/         # Layout components
│   │   │   ├── Footer.js   # Footer component
│   │   │   ├── Header.js   # Header component
│   │   │   └── Sidebar.js  # Sidebar navigation
│   │   ├── data/           # Data-related components
│   │   │   ├── DataPreview.js            # Data preview component
│   │   │   ├── DataTable.js              # Data table component
│   │   │   ├── EnhancedFileUploader.js   # Enhanced file upload component
│   │   │   ├── DataSourceSelector.js     # Data source selection
│   │   │   └── DataStatistics.js         # Data statistics component
│   │   ├── charts/         # Visualization components
│   │   │   ├── BarChart.js              # Bar chart component
│   │   │   ├── LineChart.js             # Line chart component
│   │   │   ├── PieChart.js              # Pie chart component
│   │   │   ├── ScatterPlot.js           # Scatter plot component
│   │   │   └── VisualizationRequest.js  # Visualization request component
│   │   ├── chat/           # Chat interface components
│   │   │   ├── ChatBubble.js            # Chat message bubble
│   │   │   ├── ChatInput.js             # Chat input field
│   │   │   ├── ChatHistory.js           # Chat history display
│   │   │   ├── SuggestionChips.js       # Suggestion chips
│   │   │   └── EnhancedChatInterface.js # Enhanced chat interface
│   │   └── dashboard/      # Dashboard components
│   │       ├── DashboardCard.js         # Dashboard card component
│   │       ├── StatisticWidget.js       # Statistics widget
│   │       ├── RecentActivity.js        # Recent activity component
│   │       ├── ApiStatusWidget.js       # API status widget
│   │       └── VisualizationPanel.js    # Visualization panel
│   ├── pages/              # Application pages
│   │   ├── LandingPage.js             # Landing/home page
│   │   ├── Dashboard.js               # Main dashboard page
│   │   ├── ChatInterface.js           # Chat interface page
│   │   ├── DataExplorer.js            # Data exploration page
│   │   ├── VisualizationBuilder.js    # Visualization builder
│   │   ├── Settings.js                # User settings page
│   │   ├── LoginPage.js               # Login page with API key entry
│   │   └── EnhancedDashboard.js       # Enhanced dashboard implementation
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.js      # Authentication hook
│   │   ├── useData.js      # Data fetching hook
│   │   └── useLocalStorage.js # Local storage hook
│   ├── context/            # React context providers
│   │   ├── AuthContext.js  # Enhanced authentication context
│   │   ├── DataContext.js  # Enhanced data context
│   │   └── ThemeContext.js # Theme context
│   ├── services/           # API and service integrations
│   │   ├── api.js          # API client setup with deployed backend URL
│   │   ├── apiUtils.js     # API utility functions
│   │   ├── dataService.js  # Enhanced data-related API calls
│   │   ├── authService.js  # Enhanced authentication service
│   │   ├── chatService.js  # Enhanced chat API integration
│   │   └── sessionService.js # Session management service
│   ├── utils/              # Utility functions
│   │   ├── formatters.js   # Data formatting utilities
│   │   ├── validators.js   # Form validation utilities
│   │   └── helpers.js      # General helper functions
│   ├── constants/          # Application constants
│   │   ├── routes.js       # Route definitions
│   │   ├── apiEndpoints.js # Updated API endpoint constants
│   │   └── theme.js        # Theme constants
│   └── assets/             # Component-specific assets
│       ├── styles/         # Component styles
│       └── icons/          # Custom icons
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation

## Features

- Modern React components with animations
- Interactive data visualizations
- Responsive dashboard layout
- AI-powered chatbot interface
- File upload and data processing
- Data analysis and exploration tools

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

## Technologies

- React 18
- React Router for navigation
- Material UI for components
- Chart.js and Recharts for visualizations
- Axios for API requests
- Styled Components for styling
- React Dropzone for file uploads



