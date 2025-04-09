from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.e2b import E2BTools
from agno.tools.csv_toolkit import CsvTools
from agno.tools.reasoning import ReasoningTools
import os
import argparse

# Configure E2B sandbox environment for secure and powerful data processing
e2b_tools = E2BTools(
    timeout=900,  # 15 minutes timeout (in seconds)
    filesystem=True,
    internet_access=True,
    sandbox_management=True,
    command_execution=True,
)

# Create a comprehensive data analyst agent with powerful tools
data_analyst = Agent(
    name="Advanced Data Analyst",
    agent_id="data-scientist-pro",
    model=OpenAIChat(id="gpt-4o"),
    tools=[e2b_tools, CsvTools(), ReasoningTools()],
    markdown=True,
    show_tool_calls=True,
    description="""You are an expert data scientist and analyst with exceptional CSV processing capabilities, 
    powered by the E2B sandbox environment. You expertly handle data cleaning, transformation, 
    statistical analysis, and visualization. You can process complex datasets, identify patterns, 
    correlations, and outliers, and create publication-quality visualizations. You excel at explaining 
    complex statistical concepts in accessible language and providing actionable business insights.""",
    instructions=[
        "Perform comprehensive data analysis including exploratory analysis, statistical testing, and pattern identification",
        "Clean and preprocess data to handle missing values, outliers, and inconsistencies with appropriate techniques",
        "Visualize data using the most informative charts and graphs based on data characteristics",
        "Apply statistical methods appropriate to the data type and research questions",
        "Explain your methodology and insights in clear, actionable terms with business context",
        "Generate predictive models when appropriate and evaluate their performance",
        "Recommend concrete actions based on data insights to drive decision-making",
        "Document your process thoroughly for reproducibility and knowledge transfer",
        "Identify potential biases or limitations in data collection and analysis",
    ],
)

def run_interactive_mode():
    """Run the agent in interactive mode, allowing users to input queries directly"""
    print("🔍 Advanced Data Analyst Agent Interactive Mode")
    print("Type 'exit' to quit the interactive session")
    
    while True:
        user_input = input("\n📊 Enter your data analysis query: ")
        if user_input.lower() in ['exit', 'quit']:
            print("Exiting interactive mode. Goodbye!")
            break
        
        print("\n🧮 Processing your request...\n")
        data_analyst.print_response(user_input)

def analyze_file(file_path, analysis_type=None):
    """Analyze a specific file provided by the user
    
    Args:
        file_path: Path to the file to analyze
        analysis_type: Type of analysis to perform (optional)
    """
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found at {file_path}")
        return
    
    # Check if the file has a valid extension
    _, ext = os.path.splitext(file_path)
    if ext.lower() not in ['.csv', '.xlsx', '.xls', '.tsv']:
        print(f"❌ Error: File type {ext} not supported. Please provide a CSV, Excel, or TSV file.")
        return
    
    print(f"📊 Analyzing file: {file_path}")
    
    # If analysis type is specified
    if analysis_type:
        prompt = f"Analyze the file at path '{file_path}' and perform a {analysis_type} analysis."
    else:
        # Default analysis (comprehensive)
        prompt = f"""Analyze the file at path '{file_path}' and perform the following tasks:
        1. Summarize the dataset (size, columns, data types)
        2. Identify and handle any missing values or anomalies
        3. Provide descriptive statistics for all numeric columns
        4. Identify relationships and correlations between variables
        5. Create appropriate visualizations to illustrate key findings
        6. Provide actionable insights and recommendations based on the data
        """
    
    # Run the analysis
    data_analyst.print_response(prompt)

def demonstrate_capabilities():
    """Show example capabilities of the data analyst agent"""
    print("\n=== ADVANCED DATA ANALYST CAPABILITIES ===\n")
    
    # Example 1: Data exploration and visualization
    print("\n📈 EXAMPLE 1: Data Exploration and Visualization\n")
    data_analyst.print_response(
        """Create a synthetic dataset of e-commerce customer data with columns for:
        - customer_id
        - age
        - purchase_amount
        - items_purchased
        - customer_segment (New, Returning, Loyal)
        - satisfaction_score
        
        Then perform exploratory data analysis including:
        1. Summary statistics for all numeric columns
        2. Distribution analysis with appropriate visualizations
        3. Correlation analysis between variables
        4. Segment analysis comparing metrics across customer segments
        """
    )
    
    # Example 2: Time series analysis
    print("\n📅 EXAMPLE 2: Time Series Analysis\n")
    data_analyst.print_response(
        """Generate a synthetic time series dataset representing monthly sales over 3 years 
        with seasonal patterns and a gradual upward trend. Include columns for date, sales amount, 
        marketing spend, and a seasonal indicator. Then:
        
        1. Visualize the time series with appropriate annotations
        2. Decompose the series into trend, seasonal, and residual components
        3. Identify key seasonal patterns and anomalies
        4. Create a forecast for the next 6 months with confidence intervals
        """
    )

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Advanced Data Analyst Agent")
    parser.add_argument("--interactive", action="store_true", help="Run in interactive mode")
    parser.add_argument("--demo", action="store_true", help="Demonstrate capabilities with examples")
    parser.add_argument("--query", type=str, help="Run a single data analysis query")
    parser.add_argument("--file", type=str, help="Analyze a specific CSV file")
    parser.add_argument("--analysis-type", type=str, help="Type of analysis to perform on the file (e.g., 'exploratory', 'predictive', 'correlation')")
    
    args = parser.parse_args()
    
    if args.file:
        analyze_file(args.file, args.analysis_type)
    elif args.demo:
        demonstrate_capabilities()
    elif args.interactive:
        run_interactive_mode()
    elif args.query:
        data_analyst.print_response(args.query)
    else:
        print("Please specify a mode: --interactive, --demo, --query, or --file")
        print("Examples:")
        print("  python csv_agent/agno.py --interactive")
        print("  python csv_agent/agno.py --file /path/to/data.csv")
        print("  python csv_agent/agno.py --file /path/to/data.csv --analysis-type exploratory")

