import os
import pandas as pd
import numpy as np
import json
import io
import tempfile
from typing import Dict, List, Union, Optional, Any
import plotly.express as px
import plotly.graph_objects as go
from langchain_openai import ChatOpenAI
from langchain_community.tools import BaseTool
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

from ingestion import DataIngestion
from data_tools import DataFrameTool, DataVisualizationTool, DataInsightTool
from agent_base import BaseDataAnalystAgent

class EnhancedDataAnalystAgent(BaseDataAnalystAgent):
    """
    Enhanced Data Analyst Agent that combines features from both chatbot.py and data_analyst_agent.py
    to provide rich textual answers alongside visualizations.
    """
    
    def __init__(self, openai_api_key=None, model_name="gpt-4", gemini_api_key=None):
        """Initialize the agent with tools and LLM."""
        self.openai_api_key = openai_api_key
        self.model_name = model_name
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        
        # Initialize data ingestion
        self.data_ingestion = DataIngestion(verbose=False, gemini_api_key=self.gemini_api_key)
        
        # Initialize standard tools
        self.dataframe_tool = EnhancedDataFrameTool()
        self.visualization_tool = DataVisualizationTool()
        self.visualization_tool.dataframe_tool = self.dataframe_tool
        self.insight_tool = DataInsightTool()
        self.insight_tool.dataframe_tool = self.dataframe_tool
        self.insight_tool.visualization_tool = self.visualization_tool
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=0.2,
            api_key=openai_api_key
        )
        self.insight_tool.llm = self.llm
        
        # Initialize chat prompt
        self.chat_prompt = self._create_chat_prompt()
        
        # Initialize state
        self.state = {
            "messages": [],
            "current_tool": "",
            "current_query": "",
            "dataframe": None,
            "dataframe_loaded": False
        }
    
    def update_api_key(self, openai_api_key=None, gemini_api_key=None):
        """Update API keys if needed"""
        if openai_api_key:
            self.openai_api_key = openai_api_key
            self.llm.api_key = openai_api_key
        
        if gemini_api_key:
            self.gemini_api_key = gemini_api_key
            self.data_ingestion.gemini_api_key = gemini_api_key
    
    def _create_chat_prompt(self):
        """Create a prompt template for generating chat responses"""
        template = """
        You are a data analysis assistant that helps generate insights and visualization code based on data.
        
        DATA SUMMARY:
        {df_info}
        
        COLUMN INFORMATION:
        {columns_info}
        
        SAMPLE DATA:
        {sample_data}
        
        BASIC STATISTICS:
        {basic_stats}
        
        USER QUERY: {query}
        
        Based on the data provided and the user's query, please provide:
        1. A clear, detailed answer to the query with specific facts and figures from the data
        2. Include specific values, trends, patterns, or insights directly from the data that answer the query
        3. If applicable, explain which company, category, or entity has the highest/lowest values
        4. For aggregate questions (most, highest, average, etc.), provide exact numbers
        
        Return your response as a JSON with the following structure:
        {{
            "insight": "Your detailed textual answer with specific data points and figures",
            "visualization_code": "Python code for visualization if applicable, otherwise empty string",
            "visualization_type": "Type of visualization (bar, line, scatter, etc.) or None"
        }}
        
        Make sure your insight directly answers the user's question with specific data from the dataset.
        """
        
        return ChatPromptTemplate.from_template(template)
    
    def load_data_from_file(self, file_path):
        """Load data from a file using DataIngestion."""
        try:
            _, extension = os.path.splitext(file_path)
            file_type = extension[1:].lower()  # Remove the dot
            
            # Check if this is an image file that needs special processing
            image_extensions = ['jpg', 'jpeg', 'png', 'tiff', 'bmp']
            
            # Use DataIngestion to load and preprocess the file
            df = self.data_ingestion.load_data(file_path, file_type=file_type)
            
            # For image files, check if we got valid data
            if file_type in image_extensions and df.empty:
                return f"Error: Could not extract table data from image. Please try a different image or format."
            
            # Clean the data
            if not df.empty:
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
            
            return result
        except Exception as e:
            return f"Error loading file: {str(e)}"
    
    def load_data_from_string(self, data_str, file_format="csv"):
        """Load data from a string."""
        try:
            df = None
            if file_format.lower() == "csv":
                df = pd.read_csv(io.StringIO(data_str))
            elif file_format.lower() in ["excel", "xlsx", "xls"]:
                df = pd.read_excel(io.BytesIO(data_str.encode()))
            elif file_format.lower() == "json":
                df = pd.read_json(io.StringIO(data_str))
            elif file_format.lower() in ["image", "jpg", "jpeg", "png", "tiff", "bmp"]:
                # For image data provided as base64 or raw bytes
                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_format}") as tmp_file:
                    if isinstance(data_str, bytes):
                        tmp_file.write(data_str)
                    else:
                        tmp_file.write(data_str.encode())
                    temp_path = tmp_file.name
                
                try:
                    # Use DataIngestion to extract table from image
                    df = self.data_ingestion.load_data(temp_path, file_type=file_format)
                    os.unlink(temp_path)
                except Exception as e:
                    try:
                        os.unlink(temp_path)
                    except:
                        pass
                    raise e
            else:
                return f"Unsupported file format: {file_format}"
            
            if df is None or df.empty:
                return f"Could not extract data from the provided {file_format} content."
            
            # Generate DataFrame description
            self.dataframe_tool.dataframe = df
            self.dataframe_tool.dataframe_description = self._generate_df_description(df)
            
            # Update state
            self.state["dataframe_loaded"] = True
            self.state["dataframe"] = df
            
            # Add message about successful data loading
            result = f"Data loaded successfully with {len(df)} rows and {len(df.columns)} columns.\n{self.dataframe_tool.dataframe_description}"
            
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
        """Process a user query with both textual insights and visualizations."""
        try:
            # Check if dataframe is loaded
            if not self.state["dataframe_loaded"] or self.dataframe_tool.dataframe is None:
                return "No data has been loaded yet. Please load data first."
            
            # Set current query
            self.state["current_query"] = user_input
            
            # Determine if query requires specific analysis
            query_lower = user_input.lower()
            
            # For direct operations that require a specific tool
            if any(term in query_lower for term in ["visualize", "plot", "chart", "graph", "show me"]):
                # Use visualization tool
                self.state["current_tool"] = "visualization_tool"
                result = self.visualization_tool._run(user_input)
                
                # If result is HTML, it's a visualization
                if isinstance(result, str) and "<div" in result:
                    return {
                        "response": f"Here's a visualization based on your query: '{user_input}'",
                        "visualization": result,
                        "visualization_type": "plotly"
                    }
                return result
            
            # For specific data operations
            if any(term in query_lower for term in ["compute", "calculate", "filter", "sort", "show"]):
                # Use dataframe tool
                self.state["current_tool"] = "dataframe_tool" 
                result = self.dataframe_tool._run(user_input)
                
                if isinstance(result, dict):
                    return result
                return {"response": result}
            
            # For "most" or "top" company/type queries, implement custom analysis
            if ("most" in query_lower or "top" in query_lower or "highest" in query_lower or "largest" in query_lower) and "company" in query_lower:
                return self._analyze_top_companies(user_input)
            
            # For generic queries, use the chatbot-style analysis
            return self._generate_chat_response(user_input)
        
        except Exception as e:
            error_msg = f"Error processing query: {str(e)}"
            return {"response": error_msg}
    
    def _analyze_top_companies(self, query):
        """Analyze companies based on their sales, counts, or other metrics."""
        df = self.dataframe_tool.dataframe
        query_lower = query.lower()
        
        # Default to counting by company if no specific metric is mentioned
        if "company" in query_lower and ("sales" in query_lower or "count" in query_lower or "most" in query_lower):
            # Count occurrences of each company
            company_counts = df["Company"].value_counts()
            top_company = company_counts.idxmax()
            top_count = company_counts.max()
            
            # Generate the result
            company_count_df = company_counts.reset_index()
            company_count_df.columns = ['Company', 'Count']
            
            # Sort by count in descending order
            company_count_df = company_count_df.sort_values('Count', ascending=False)
            
            # Create a bar chart visualization
            fig = px.bar(
                company_count_df.head(10), 
                x='Company', 
                y='Count', 
                title='Top Companies by Product Count',
                labels={'Count': 'Number of Products', 'Company': 'Company Name'}
            )
            
            # Format the response
            response_text = f"The company with the most products in the dataset is {top_company} with {top_count} products. "
            response_text += f"\n\nHere's the breakdown of the top companies by product count:\n"
            
            for _, row in company_count_df.head(10).iterrows():
                response_text += f"- {row['Company']}: {row['Count']} products\n"
            
            visualization_html = fig.to_html(full_html=False, include_plotlyjs='cdn')
            
            # Return both textual insights and visualization
            return {
                "response": response_text,
                "visualization": visualization_html,
                "visualization_type": "plotly",
                "data": {
                    "top_company": top_company,
                    "top_count": int(top_count),
                    "company_counts": company_count_df.head(10).to_dict(orient="records")
                }
            }
        
        # If no specific analysis is found, fall back to generic chat response
        return self._generate_chat_response(query)
    
    def _generate_chat_response(self, query):
        """Generate a detailed chat response using the LLM with modern Langchain chaining."""
        try:
            df = self.dataframe_tool.dataframe
            
            # Detect if this is an aggregation/groupby type of query
            query_lower = query.lower()
            
            # Keywords that suggest grouping operations
            group_keywords = ['by', 'across', 'per', 'each', 'every', 'grouped', 'segmented', 'category', 'categories']
            agg_keywords = ['average', 'avg', 'mean', 'highest', 'lowest', 'max', 'min', 'sum', 'total', 'count', 'median']
            group_indicators = [' by ', ' across ', ' per ', ' for each ', ' in each ', ' across different ']
            
            # Check if this looks like a groupby query
            is_group_query = any(indicator in ' ' + query_lower + ' ' for indicator in group_indicators) or (
                any(keyword in query_lower for keyword in group_keywords) and 
                any(keyword in query_lower for keyword in agg_keywords)
            )
            
            # Try direct data analysis for groupby queries
            if is_group_query:
                try:
                    # First, identify potential categorical columns for grouping
                    categorical_cols = []
                    for col in df.columns:
                        # If it's an object, categorical, or has few unique values
                        if df[col].dtype == 'object' or df[col].dtype.name == 'category' or (
                            pd.api.types.is_numeric_dtype(df[col].dtype) and df[col].nunique() < 20
                        ):
                            categorical_cols.append(col)
                    
                    # Identify numeric columns for aggregation
                    numeric_cols = []
                    for col in df.columns:
                        if pd.api.types.is_numeric_dtype(df[col].dtype) and col not in ['id', 'index']:
                            numeric_cols.append(col)
                    
                    # Find which categorical column might be mentioned in the query
                    group_col = None
                    for col in categorical_cols:
                        # Check variations of the column name
                        col_variations = [col.lower(), col.replace('_', ' ').lower()]
                        if any(variation in query_lower for variation in col_variations):
                            group_col = col
                            break
                    
                    # Find which numeric column might be mentioned in the query
                    agg_col = None
                    for col in numeric_cols:
                        # Check variations of the column name
                        col_variations = [col.lower(), col.replace('_', ' ').lower()]
                        if any(variation in query_lower for variation in col_variations):
                            agg_col = col
                            break
                    
                    # If we have a group column but no clear aggregation column,
                    # use the first numeric column that's not the group column
                    if group_col and not agg_col and numeric_cols:
                        for col in numeric_cols:
                            if col != group_col:
                                agg_col = col
                                break
                    
                    # If we found both columns, perform the analysis
                    if group_col and agg_col:
                        # Determine the aggregation operation to use
                        agg_op = 'mean'  # Default to mean
                        
                        if any(term in query_lower for term in ['highest', 'maximum', 'max', 'top', 'most']):
                            sort_ascending = False
                            compare_type = "highest"
                        elif any(term in query_lower for term in ['lowest', 'minimum', 'min', 'bottom', 'least']):
                            sort_ascending = True
                            compare_type = "lowest"
                        else:
                            sort_ascending = None
                            compare_type = "average"
                        
                        # Perform the groupby operation
                        grouped = df.groupby(group_col)[agg_col].agg(agg_op).reset_index()
                        
                        # Sort if needed
                        if sort_ascending is not None:
                            grouped = grouped.sort_values(agg_col, ascending=sort_ascending)
                        
                        # Format results for display
                        result_text = f"Analysis of {agg_col} by {group_col}:\n\n"
                        
                        # If looking for highest/lowest, highlight that
                        if sort_ascending is not None:
                            top_group = grouped.iloc[0][group_col]
                            top_value = grouped.iloc[0][agg_col]
                            
                            result_text += f"The {group_col} with the {compare_type} {agg_op} {agg_col} is '{top_group}' "
                            result_text += f"with a value of {top_value:.2f}.\n\n"
                        
                        # Add the full breakdown
                        result_text += f"Here's the {agg_op} of {agg_col} for each {group_col}:\n"
                        for _, row in grouped.iterrows():
                            result_text += f"- {row[group_col]}: {row[agg_col]:.2f}\n"
                        
                        # Create visualization
                        fig = px.bar(
                            grouped,
                            x=group_col,
                            y=agg_col,
                            title=f'{agg_op.capitalize()} of {agg_col} by {group_col}',
                            labels={agg_col: f'{agg_op.capitalize()} of {agg_col}'}
                        )
                        
                        visualization = fig.to_html(full_html=False, include_plotlyjs='cdn')
                        
                        # Return results with visualization
                        return {
                            "response": result_text,
                            "visualization": visualization,
                            "visualization_type": "plotly",
                            "data": grouped.to_dict(orient="records")
                        }
                except Exception as e:
                    # If the direct analysis fails, fall back to the LLM
                    pass
            
            # Prepare data info for the prompt
            buffer = io.StringIO()
            df.info(buf=buffer)
            df_info = buffer.getvalue()
            
            # Generate column info
            columns_info = "\n".join([f"- {col}: {df[col].dtype}" for col in df.columns])
            
            # Get sample data
            sample_data = df.head(5).to_string()
            
            # Get basic stats
            basic_stats = df.describe().to_string()
            
            # Create the prompt template with enhanced instructions for groupby operations
            chat_template = ChatPromptTemplate.from_template("""
            You are a data analysis assistant that helps generate insights and visualization code based on data.
            
            DATA SUMMARY:
            {df_info}
            
            COLUMN INFORMATION:
            {columns_info}
            
            SAMPLE DATA:
            {sample_data}
            
            BASIC STATISTICS:
            {basic_stats}
            
            USER QUERY: {query}
            
            INSTRUCTIONS FOR DATA ANALYSIS:
            
            1. For questions about averages, maximums, minimums or other aggregations BY a category/group:
               - Use pandas groupby operations: df.groupby('group_column')['metric_column'].agg_operation()
               - Show exact numeric values for each group
               - Clearly state which group has the highest/lowest value
               - Example: "Which category has highest average sales?"
                 ```python
                 result = df.groupby('category')['sales'].mean().sort_values(ascending=False)
                 highest_category = result.index[0]
                 highest_value = result.iloc[0]
                 print(f"The category with highest average sales is {{highest_category}} with ${{highest_value:.2f}}")
                 ```
            
            2. For more complex questions requiring multiple operations:
               - Break down the analysis into steps
               - Show intermediate results where helpful
               - Use appropriate pandas operations (groupby, pivot_table, etc.)
            
            3. Visualization recommendations:
               - For comparing groups: Bar charts (px.bar)
               - For time trends: Line charts (px.line)
               - For relationships: Scatter plots (px.scatter)
               - For distributions: Histograms (px.histogram) or Box plots (px.box)
            
            Your response MUST be a valid JSON with these keys:
            {{
                "insight": "Detailed answer with specific data points and values",
                "visualization_code": "Python code for creating a visualization",
                "visualization_type": "Type of chart (bar, line, scatter, etc.)"
            }}
            
            IMPORTANT: Return ONLY the JSON without any other text.
            """)
            
            # Create the output parser with error handling
            class SafeJsonOutputParser(JsonOutputParser):
                def parse(self, text):
                    try:
                        return super().parse(text)
                    except Exception as e:
                        # Extract just the content part if there's JSON embedded in text
                        import re
                        import json
                        
                        # Try to find JSON pattern
                        json_match = re.search(r'({[\s\S]*})', text)
                        if json_match:
                            try:
                                return json.loads(json_match.group(1))
                            except:
                                pass
                        
                        # Fallback to a properly formatted response
                        return {
                            "insight": f"I encountered an error analyzing your query about '{query}'. The dataset may not contain the information you're looking for, or it might be structured differently than expected.",
                            "visualization_code": "",
                            "visualization_type": None
                        }
            
            # Create the chain with the safe parser
            output_parser = SafeJsonOutputParser()
            
            # Create the chain
            chain = (
                chat_template 
                | self.llm 
                | output_parser
            )
            
            # Invoke the chain
            try:
                result = chain.invoke({
                    "df_info": df_info,
                    "columns_info": columns_info,
                    "sample_data": sample_data,
                    "basic_stats": basic_stats,
                    "query": query
                })
            except Exception as e:
                # Fallback for chain invocation errors
                return {
                    "response": f"I encountered an error analyzing your query about '{query}'. The error was: {str(e)}. The dataset might not contain the information you're looking for.",
                    "visualization": None,
                    "visualization_code": None,
                    "visualization_type": None
                }
            
            # Process the result
            insight = result.get("insight", "")
            visualization_code = result.get("visualization_code", "")
            visualization_type = result.get("visualization_type", None)
            
            # If no visualization but we have code, try to generate one
            visualization = None
            if visualization_code and not visualization:
                try:
                    # This is risky, but for complex visualizations, we need to execute code
                    # Only do this in controlled environments!
                    local_vars = {'df': df, 'px': px, 'go': go, 'pd': pd, 'np': np}
                    
                    # Extract just the visualization part if it's a complete script
                    vis_code = visualization_code
                    if 'import' in vis_code:
                        vis_code = '\n'.join([line for line in vis_code.split('\n') 
                                             if not line.strip().startswith('import') and line.strip()])
                    
                    if 'fig = ' in vis_code or 'plt.' in vis_code:
                        # Execute in a restricted namespace
                        exec(vis_code, {}, local_vars)
                        
                        # Try to find the figure in local vars
                        if 'fig' in local_vars:
                            visualization = local_vars['fig'].to_html(full_html=False, include_plotlyjs='cdn')
                except Exception as viz_error:
                    # If visualization generation fails, just continue without it
                    pass
            
            return {
                "response": insight,
                "visualization": visualization,
                "visualization_code": visualization_code,
                "visualization_type": visualization_type
            }
                
        except Exception as e:
            return {"response": f"Error generating response: {str(e)}"}


class EnhancedDataFrameTool(DataFrameTool):
    """Enhanced DataFrameTool with better handling of queries about top companies."""
    
    def _run(self, query: str) -> str:
        """Execute pandas operations on the stored DataFrame with enhanced responses."""
        if self.dataframe is None:
            return "No DataFrame is loaded. Please load data first."
        
        try:
            # Extract operations from the query
            query_lower = query.lower()
            
            # Handle specific company queries
            if "company" in query_lower and ("most" in query_lower or "top" in query_lower or "highest" in query_lower):
                company_counts = self.dataframe["Company"].value_counts()
                top_company = company_counts.idxmax()
                top_count = company_counts.max()
                
                # Get top 10 companies
                top_companies = company_counts.head(10)
                
                return {
                    "response": f"The company with the most products is {top_company} with {top_count} products.",
                    "operation": "Company Analysis",
                    "result": {
                        "top_company": top_company,
                        "count": int(top_count),
                        "top_companies": top_companies.to_dict()
                    }
                }
            
            # Basic DataFrame operations (same as in original DataFrameTool)
            if "describe" in query_lower or "summary" in query_lower or "statistics" in query_lower:
                result = self.dataframe.describe().to_dict()
                return {
                    "response": "Here are the statistical summaries of the numeric columns:",
                    "operation": "DataFrame Description",
                    "result": result
                }
            elif "info" in query_lower or "columns" in query_lower or "dtype" in query_lower:
                info = {
                    "shape": self.dataframe.shape,
                    "columns": [
                        {"name": col, "dtype": str(self.dataframe[col].dtype), 
                         "non_null": int(self.dataframe[col].count()),
                         "nulls": int(self.dataframe[col].isna().sum())}
                        for col in self.dataframe.columns
                    ]
                }
                return {
                    "response": f"DataFrame has {self.dataframe.shape[0]} rows and {self.dataframe.shape[1]} columns.",
                    "operation": "DataFrame Info",
                    "result": info
                }
            elif any(term in query_lower for term in ["head", "top", "first few"]):
                num_rows = 5
                for num in [str(i) for i in range(1, 11)]:
                    if num in query_lower:
                        num_rows = int(num)
                        break
                
                result = self.dataframe.head(num_rows).to_dict(orient="records")
                return {
                    "response": f"Here are the first {num_rows} rows of the DataFrame:",
                    "operation": f"DataFrame Head ({num_rows} rows)",
                    "result": result
                }
            elif any(term in query_lower for term in ["tail", "bottom", "last few"]):
                num_rows = 5
                for num in [str(i) for i in range(1, 11)]:
                    if num in query_lower:
                        num_rows = int(num)
                        break
                
                result = self.dataframe.tail(num_rows).to_dict(orient="records")
                return {
                    "response": f"Here are the last {num_rows} rows of the DataFrame:",
                    "operation": f"DataFrame Tail ({num_rows} rows)",
                    "result": result
                }
            elif "shape" in query_lower or "dimensions" in query_lower or "size" in query_lower:
                return {
                    "response": f"DataFrame has {self.dataframe.shape[0]} rows and {self.dataframe.shape[1]} columns.",
                    "operation": "DataFrame Shape",
                    "result": {"rows": self.dataframe.shape[0], "columns": self.dataframe.shape[1]}
                }
            # Default response
            else:
                return {
                    "response": "DataFrame Query completed successfully.",
                    "operation": "DataFrame Query",
                    "result": {
                        "shape": {"rows": self.dataframe.shape[0], "columns": self.dataframe.shape[1]},
                        "columns": list(self.dataframe.columns)
                    }
                }
        except Exception as e:
            return {
                "response": f"Error executing DataFrame operation: {str(e)}",
                "operation": "Error",
                "result": None
            }


def create_enhanced_data_analyst_agent(openai_api_key=None, model_name="gpt-4", gemini_api_key=None):
    """Create and return an enhanced data analyst agent."""
    return EnhancedDataAnalystAgent(openai_api_key=openai_api_key, model_name=model_name, gemini_api_key=gemini_api_key)


# Example usage
if __name__ == "__main__":
    import os
    
    # Get API key from environment variable
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    
    # Create agent
    agent = create_enhanced_data_analyst_agent(openai_api_key=openai_api_key)
    
    # Example: Load test.csv data
    result = agent.load_data_from_file("test_files/test.csv")
    print(result)
    
    # Test company query
    response = agent.query("Which company has the most products in the dataset?")
    print("\nQuery: Which company has the most products in the dataset?")
    print("Response:", response.get("response", ""))
    
    # Test another query
    response = agent.query("What's the average price by company?")
    print("\nQuery: What's the average price by company?")
    print("Response:", response.get("response", "")) 