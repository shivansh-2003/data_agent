import pandas as pd
import numpy as np
import os
import io
from typing import Dict, List, Union, Optional, Any
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from langgraph_agent import create_langgraph_data_analyst_agent
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage
from langchain.tools import BaseTool

from ingestion import DataIngestion
from agent_base import BaseDataAnalystAgent
from data_tools import DataFrameTool, DataVisualizationTool, DataInsightTool
from langgraph_agent import SimpleToolExecutor

class DataAnalystAgent(BaseDataAnalystAgent):
    """
    Data Analyst Agent implemented using LangChain tools.
    Provides similar functionality to the LangGraph agent.
    """
    
    def __init__(self, openai_api_key=None, model_name="gpt-4"):
        """Initialize the agent with tools and LLM."""
        self.openai_api_key = openai_api_key
        self.model_name = model_name
        
        # Initialize data ingestion
        self.data_ingestion = DataIngestion(verbose=False)
        
        # Initialize tools
        self.dataframe_tool = DataFrameTool()
        self.visualization_tool = DataVisualizationTool()
        self.visualization_tool.dataframe_tool = self.dataframe_tool
        self.insight_tool = DataInsightTool()
        self.insight_tool.dataframe_tool = self.dataframe_tool
        self.insight_tool.visualization_tool = self.visualization_tool
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=0,
            api_key=openai_api_key
        )
        self.insight_tool.llm = self.llm
        
        # Create tool executor
        self.tools = [self.dataframe_tool, self.visualization_tool, self.insight_tool]
        self.tool_executor = SimpleToolExecutor(self.tools)
        
        # Initialize state
        self.state = {
            "messages": [],
            "current_tool": "",
            "current_query": "",
            "dataframe": None,
            "dataframe_loaded": False
        }
    
    def load_data_from_file(self, file_path):
        """Load data from a file using DataIngestion."""
        try:
            _, extension = os.path.splitext(file_path)
            file_type = extension[1:].lower()  # Remove the dot
            
            # Use DataIngestion to load and preprocess the file
            df = self.data_ingestion.load_data(file_path, file_type=file_type)
            
            # Clean the data
            df = self.data_ingestion.clean_data(
                handle_missing=True,
                handle_duplicates=True,
                missing_strategy='auto'
            )
            
            # Set the DataFrame in the tools
            self.dataframe_tool.dataframe = df
            
            # Generate DataFrame description
            self.dataframe_tool.dataframe_description = self._generate_df_description(df)
            
            # Update state
            self.state["dataframe_loaded"] = True
            self.state["dataframe"] = df
            
            # Add message about successful data loading
            result = f"Data loaded successfully with {len(df)} rows and {len(df.columns)} columns.\n{self.dataframe_tool.dataframe_description}"
            self.state["messages"].append(HumanMessage(content=f"I've loaded data from {file_path}"))
            self.state["messages"].append(AIMessage(content=result))
            
            return result
        except Exception as e:
            return f"Error loading file: {str(e)}"
    
    def load_data_from_string(self, data_str, file_format="csv"):
        """Load data from a string."""
        try:
            if file_format.lower() == "csv":
                self.dataframe_tool.dataframe = pd.read_csv(io.StringIO(data_str))
            elif file_format.lower() in ["excel", "xlsx", "xls"]:
                self.dataframe_tool.dataframe = pd.read_excel(io.BytesIO(data_str.encode()))
            elif file_format.lower() == "json":
                self.dataframe_tool.dataframe = pd.read_json(io.StringIO(data_str))
            else:
                return f"Unsupported file format: {file_format}"
            
            # Generate DataFrame description
            self.dataframe_tool.dataframe_description = self._generate_df_description(
                self.dataframe_tool.dataframe
            )
            
            # Update state
            self.state["dataframe_loaded"] = True
            self.state["dataframe"] = self.dataframe_tool.dataframe
            
            # Add message about successful data loading
            result = f"Data loaded successfully with {len(self.dataframe_tool.dataframe)} rows and {len(self.dataframe_tool.dataframe.columns)} columns.\n{self.dataframe_tool.dataframe_description}"
            self.state["messages"].append(HumanMessage(content=f"I've loaded {file_format} data"))
            self.state["messages"].append(AIMessage(content=result))
            
            return result
        except Exception as e:
            return f"Error loading data: {str(e)}"
    
    def _generate_df_description(self, df: pd.DataFrame) -> str:
        """Generate a basic description of the DataFrame."""
        if df is None:
            return "No DataFrame is loaded."
        
        description = [f"DataFrame Shape: {df.shape[0]} rows × {df.shape[1]} columns"]
        
        column_info = []
        for col in df.columns:
            dtype = df[col].dtype
            missing = df[col].isna().sum()
            missing_pct = (missing / len(df)) * 100
            
            if pd.api.types.is_numeric_dtype(dtype):
                min_val = df[col].min()
                max_val = df[col].max()
                mean_val = df[col].mean()
                column_info.append(f"  - {col} (type: {dtype}): {missing} missing values ({missing_pct:.2f}%), range: [{min_val} to {max_val}], mean: {mean_val:.2f}")
            else:
                unique = df[col].nunique()
                column_info.append(f"  - {col} (type: {dtype}): {missing} missing values ({missing_pct:.2f}%), {unique} unique values")
        
        description.append("\n".join(column_info))
        description.append("\nSample Data (first 5 rows):")
        description.append(df.head(5).to_string())
        
        return "\n".join(description)
    
    def query(self, user_input):
        """Process a user query."""
        try:
            # Add user message to history
            self.state["messages"].append(HumanMessage(content=user_input))
            
            # Set current query
            self.state["current_query"] = user_input
            
            # Determine which tool to use (simplified version)
            query_lower = user_input.lower()
            
            if "visualize" in query_lower or "plot" in query_lower or "chart" in query_lower:
                response = self.tool_executor.invoke({"name": "visualization_tool", "input": user_input})
            elif "insight" in query_lower or "summary" in query_lower or "analyze" in query_lower:
                response = self.tool_executor.invoke({"name": "insight_tool", "input": user_input})
            else:
                response = self.tool_executor.invoke({"name": "dataframe_tool", "input": user_input})
            
            # Add response to messages
            self.state["messages"].append(AIMessage(content=response))
            
            return response
        except Exception as e:
            return f"Error processing query: {str(e)}"

def create_data_analyst_agent(openai_api_key=None, model_name="gpt-4"):
    """Create and return a data analyst agent."""
    return DataAnalystAgent(openai_api_key=openai_api_key, model_name=model_name)

# Example usage
if __name__ == "__main__":
    import os
    
    # Get API key from environment variable
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    
    # Create agent
    agent = create_data_analyst_agent(openai_api_key=openai_api_key)
    
    # Example data
    example_data = """
    date,sales,expenses,profit
    2023-01-01,1000,700,300
    2023-02-01,1200,750,450
    2023-03-01,1100,800,300
    2023-04-01,1300,850,450
    2023-05-01,1500,900,600
    2023-06-01,1700,950,750
    2023-07-01,1900,1000,900
    2023-08-01,2000,1100,900
    2023-09-01,1800,1050,750
    2023-10-01,1600,950,650
    2023-11-01,1400,850,550
    2023-12-01,1200,800,400
    """
    
    # Load data
    result = agent.load_data_from_string(example_data)
    print(result)
    
    # Query examples
    queries = [
        "Can you summarize this dataset for me?",
        "Create a visualization of the profit trend over time",
        "What was the month with the highest profit?",
        "Is there a correlation between sales and expenses?",
        "Can you forecast the profit for the next 3 months?"
    ]
    
    for query in queries:
        print(f"\n\nQUERY: {query}")
        print("-" * 80)
        response = agent.query(query)
        print(response)

def _initialize_agent(self, api_key: str, model: str, agent_type: str):
    """Initialize or update the AI agent"""
    if not api_key:
        st.error("Please enter your OpenAI API key.")
        return
    
    with st.spinner("Initializing AI agent..."):
        try:
            agent_creator = (
                create_langgraph_data_analyst_agent 
                if agent_type == "LangGraph Agent" 
                else create_data_analyst_agent
            )
            # Directly assign the agent object
            st.session_state.agent = agent_creator(
                openai_api_key=api_key,
                model_name=model
            )
            st.success("Agent initialized successfully!")
        except Exception as e:
            st.error(f"Error initializing agent: {str(e)}")