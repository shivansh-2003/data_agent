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
│       └── fonts/          # Font files
├── src/                    # Source code
│   ├── App.js              # Main application component
│   ├── index.js            # Application entry point
│   ├── index.css           # Global styles
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Common UI elements
│   │   │   ├── Button.js   # Custom button component
│   │   │   ├── Card.js     # Card component
│   │   │   ├── Modal.js    # Modal dialog component
│   │   │   └── Loader.js   # Loading indicator
│   │   ├── layout/         # Layout components
│   │   │   ├── Footer.js   # Footer component
│   │   │   ├── Header.js   # Header component
│   │   │   └── Sidebar.js  # Sidebar navigation
│   │   ├── data/           # Data-related components
│   │   │   ├── DataPreview.js       # Data preview component
│   │   │   ├── DataTable.js         # Data table component
│   │   │   ├── FileUploader.js      # File upload component
│   │   │   └── DataSourceSelector.js # Data source selection
│   │   ├── charts/         # Visualization components
│   │   │   ├── BarChart.js          # Bar chart component
│   │   │   ├── LineChart.js         # Line chart component
│   │   │   ├── PieChart.js          # Pie chart component
│   │   │   └── ScatterPlot.js       # Scatter plot component
│   │   ├── chat/           # Chat interface components
│   │   │   ├── ChatBubble.js        # Chat message bubble
│   │   │   ├── ChatInput.js         # Chat input field
│   │   │   ├── ChatHistory.js       # Chat history display
│   │   │   └── SuggestionChips.js   # Suggestion chips
│   │   └── dashboard/      # Dashboard components
│   │       ├── DashboardCard.js     # Dashboard card component
│   │       ├── StatisticWidget.js   # Statistics widget
│   │       ├── RecentActivity.js    # Recent activity component
│   │       └── VisualizationPanel.js # Visualization panel
│   ├── pages/              # Application pages
│   │   ├── LandingPage.js  # Landing/home page
│   │   ├── Dashboard.js    # Main dashboard page
│   │   ├── ChatInterface.js # Chat interface page
│   │   ├── DataExplorer.js # Data exploration page
│   │   ├── VisualizationBuilder.js # Visualization builder
│   │   └── Settings.js     # User settings page
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.js      # Authentication hook
│   │   ├── useData.js      # Data fetching hook
│   │   └── useLocalStorage.js # Local storage hook
│   ├── context/            # React context providers
│   │   ├── AuthContext.js  # Authentication context
│   │   ├── DataContext.js  # Data context
│   │   └── ThemeContext.js # Theme context
│   ├── services/           # API and service integrations
│   │   ├── api.js          # API client setup
│   │   ├── dataService.js  # Data-related API calls
│   │   ├── authService.js  # Authentication service
│   │   └── chatService.js  # Chat API integration
│   ├── utils/              # Utility functions
│   │   ├── formatters.js   # Data formatting utilities
│   │   ├── validators.js   # Form validation utilities
│   │   └── helpers.js      # General helper functions
│   ├── constants/          # Application constants
│   │   ├── routes.js       # Route definitions
│   │   ├── apiEndpoints.js # API endpoint constants
│   │   └── theme.js        # Theme constants
│   └── assets/             # Component-specific assets
│       ├── styles/         # Component styles
│       └── icons/          # Custom icons
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation
```

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