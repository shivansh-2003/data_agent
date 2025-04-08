# 📊 Data Analyst AI Assistant


## 🌟 Features

- **Intelligent Data Analysis**: AI-powered insights and recommendations
- **Interactive Visualizations**: Automated chart generation based on your data
- **Natural Language Interface**: Ask questions about your data in plain English
- **Multi-format Support**: Works with CSV, Excel, PDF, and even image-based tables
- **Flexible Deployment**: Local or cloud deployment options
- **Multiple Agent Types**: Choose between LangChain and LangGraph implementations



## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- OpenAI API key
- (Optional) Google Gemini API key for enhanced image table extraction

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/data-analyst-ai.git
   cd data-analyst-ai
   ```

2. Create a virtual environment and activate it:
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here  # Optional
   ```

### Running the Application

Launch the Streamlit app:
```bash
streamlit run app.py
```

This will start the web interface, usually at http://localhost:8501.

## 💡 Usage Guide

### 1. Initialize the Agent

- Enter your OpenAI API key in the sidebar
- Select your preferred model (GPT-3.5 Turbo, GPT-4, GPT-4 Turbo)
- Choose the agent implementation (LangChain or LangGraph)
- Click "Initialize/Update Agent"

### 2. Upload Your Data

- Supported formats: CSV, Excel, PDF, and images containing tables
- The system will automatically process and display a preview

### 3. Interact with the AI

- Use the chat interface to ask questions about your data
- Example queries:
  - "Summarize this dataset"
  - "Show a chart of sales over time"
  - "What's the correlation between revenue and expenses?"
  - "Find outliers in the data"
  - "What insights can you provide about profit margins?"

### 4. Export and Share Results

- Visualizations and insights can be exported or shared
- The chat history is preserved during your session

## 🧠 Intelligent Capabilities

### Data Analysis

- **Statistical Analysis**: Descriptive statistics, correlation analysis, outlier detection
- **Time Series Analysis**: Trend detection, seasonality analysis, forecasting
- **Categorical Analysis**: Distribution analysis, contingency tables

### Visualization

- **Automatic Chart Selection**: AI chooses the most appropriate visualization
- **Interactive Charts**: Zoom, filter, and explore data visually
- **Custom Visualizations**: Ask for specific chart types or configurations

### Insights Generation

- **Data Summarization**: Get concise overviews of your dataset
- **Relationship Discovery**: Identify correlations and patterns
- **Anomaly Detection**: Find unusual patterns or outliers
- **Business Recommendations**: Get actionable insights based on your data

## 🏗️ Architecture

The application is built using a modular architecture that separates concerns and enables flexibility:

```
data-analyst-ai/
├── app.py                  # Main Streamlit application
├── agent_base.py           # Abstract base class for agents
├── data_analyst_agent.py   # LangChain agent implementation
├── langgraph_agent.py      # LangGraph agent implementation
├── data_tools.py           # Tools for data manipulation and visualization
├── enhanced_chat.py        # Enhanced chat interface functionality
├── ingestion.py            # Data ingestion from various sources
├── chatbot.py              # Standalone chat interface
├── requirements.txt        # Package dependencies
└── .env                    # Environment variables (API keys)
```

### Agent Implementation

The system supports two agent implementations:

1. **LangChain Agent**: Traditional approach using LangChain's tools and chains
2. **LangGraph Agent**: Advanced implementation using LangGraph for better state management

Both agents use a set of specialized tools:
- `DataFrameTool`: Data manipulation and analysis
- `DataVisualizationTool`: Chart generation and visualization
- `DataInsightTool`: Insights and summary generation

## 📊 Data Processing Capabilities

### Data Ingestion

The system can ingest data from multiple sources:

- **CSV/Excel Files**: Direct parsing with pandas
- **PDF Documents**: Table extraction using OCR
- **Images**: Table recognition using OCR or Google Gemini API
- **Manual Input**: Direct data entry via the interface

### Data Cleaning

Automatic data cleaning is performed with configurable strategies:

- **Missing Value Handling**: Auto-detection, imputation (mean, median, mode)
- **Duplicate Removal**: Identification and elimination of duplicate records
- **Data Type Conversion**: Automatic type inference and conversion
- **Outlier Detection**: Statistical detection of anomalous values

## 🧩 Extending the System

### Adding New Tools

1. Create a new tool class inheriting from `BaseTool`
2. Implement the required methods (especially `_run`)
3. Add the tool to the agent's tool list

Example:
```python
from langchain.tools import BaseTool

class MyCustomTool(BaseTool):
    name = "my_custom_tool"
    description = "Description of what this tool does"
    
    def _run(self, query: str) -> str:
        # Implement your tool's functionality here
        return "Result of the tool's operation"
```

### Custom Visualization Types

Add new visualization types to the `_create_visualization` method in `DataVisualizationTool`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [OpenAI](https://openai.com/) for their powerful language models
- [LangChain](https://github.com/langchain-ai/langchain) for the LLM application framework
- [LangGraph](https://github.com/langchain-ai/langgraph) for the graph-based agent architecture
- [Streamlit](https://streamlit.io/) for the interactive web interface
- [Pandas](https://pandas.pydata.org/), [Matplotlib](https://matplotlib.org/), [Plotly](https://plotly.com/), and [Seaborn](https://seaborn.pydata.org/) for data processing and visualization

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/yourusername">Your Name</a>
</p>