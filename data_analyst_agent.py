import pandas as pd
import numpy as np
import os
import io
import base64
from typing import Dict, List, Union, Optional, Any, Tuple
import json

import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from langchain.agents import AgentType, initialize_agent
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.tools import BaseTool
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate, ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from pydantic import BaseModel, Field

# Import needed for ingestion
from ingestion import DataIngestion

# Import SimpleToolExecutor from langgraph_agent
from langgraph_agent import SimpleToolExecutor

# Import DataFrameTool from data_tools
from data_tools import DataFrameTool

# DataVisualizationTool for creating visualizations
class DataVisualizationTool(BaseTool):
    """Tool for creating data visualizations using Plotly."""
    name: str = "visualization_tool"
    description: str = "Use this tool to create data visualizations"
    
    dataframe_tool: Optional[DataFrameTool] = None
    
    def _run(self, query: str) -> str:
        """Create a visualization based on the query."""
        if self.dataframe_tool is None or self.dataframe_tool.dataframe is None:
            return "No DataFrame is available for visualization. Please load data first."
        
        df = self.dataframe_tool.dataframe
        
        try:
            viz_type, params = self._parse_visualization_query(query)
            fig = self._create_visualization(df, viz_type, params)
            return self._fig_to_html(fig)
        except Exception as e:
            return f"Error creating visualization: {str(e)}"
    
    def _parse_visualization_query(self, query: str) -> tuple:
        """Parse the visualization query to determine type and parameters."""
        query = query.lower()
        params = {"title": "Data Visualization"}
        
        # Extract visualization type
        viz_types = ["bar", "histogram", "scatter", "line", "pie", "box", "heatmap", "correlation", "distribution", "summary"]
        for viz in viz_types:
            if viz in query:
                viz_type = viz
                break
        else:
            viz_type = "auto"
        
        # Extract columns to visualize
        params["columns"] = [col for col in self.dataframe_tool.dataframe.columns if col.lower() in query]
        
        # Extract other parameters
        if "by" in query or "group by" in query:
            parts = query.split("by")
            if len(parts) > 1:
                for col in self.dataframe_tool.dataframe.columns:
                    if col.lower() in parts[1].lower():
                        params["groupby"] = col
                        break
        
        if "title" in query:
            parts = query.split("title")
            if len(parts) > 1:
                title_parts = parts[1].split(",")
                params["title"] = title_parts[0].strip().strip('"\'')
        
        return viz_type, params
    
    def _create_visualization(self, df: pd.DataFrame, viz_type: str, params: Dict[str, Any]) -> go.Figure:
        """Create a Plotly visualization based on the specified type and parameters."""
        columns = params.get("columns", [])
        title = params.get("title", "Data Visualization")
        groupby = params.get("groupby", None)
        
        # Auto-select columns if none specified
        if not columns:
            numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
            categorical_cols = df.select_dtypes(exclude=np.number).columns.tolist()
            if viz_type in ["bar", "pie", "box"] and categorical_cols:
                columns = [categorical_cols[0], numeric_cols[0]] if numeric_cols else categorical_cols[:2]
            elif viz_type in ["scatter", "line"]:
                columns = numeric_cols[:2] if len(numeric_cols) > 1 else numeric_cols
            elif viz_type in ["histogram", "distribution"]:
                columns = numeric_cols[:1] if numeric_cols else []
            elif viz_type in ["heatmap", "correlation"]:
                columns = numeric_cols
            else:
                columns = df.columns.tolist()[:3]
        
        # Create visualization based on type
        fig = self._generate_plot(df, viz_type, columns, groupby, title)
        
        # Apply common layout settings
        fig.update_layout(
            title=title,
            template="plotly_white",
            margin=dict(l=50, r=50, t=80, b=50),
            height=600,
            width=900
        )
        
        return fig
    
    def _generate_plot(self, df: pd.DataFrame, viz_type: str, columns: List[str], groupby: Optional[str], title: str) -> go.Figure:
        """Generate the appropriate plot based on the visualization type."""
        if viz_type == "bar":
            if len(columns) >= 2 and groupby is None:
                return px.bar(df, x=columns[0], y=columns[1], title=title)
            elif groupby is not None and columns:
                return px.bar(df, x=columns[0], color=groupby, title=title)
            else:
                col = columns[0] if columns else df.columns[0]
                value_counts = df[col].value_counts().reset_index()
                return px.bar(value_counts, x='index', y=col, title=f"{title}: {col} Value Counts")

        elif viz_type == "histogram":
            return px.histogram(df, x=columns[0], title=f"{title}: Distribution of {columns[0]}") if columns else px.histogram(df)

        elif viz_type == "scatter":
            return px.scatter(df, x=columns[0], y=columns[1], title=f"{title}: {columns[1]} vs {columns[0]}") if len(columns) > 1 else px.scatter(df, x=columns[0])

        elif viz_type == "line":
            return px.line(df, x=columns[0], y=columns[1], title=title) if len(columns) > 1 else px.line(df, x=columns[0])

        elif viz_type == "pie":
            return px.pie(df, names=columns[0], values=columns[1], title=title) if len(columns) > 1 else px.pie(df, names=columns[0])

        elif viz_type == "box":
            return px.box(df, y=columns[0], title=title)

        elif viz_type == "heatmap":
            pivot_data = df.pivot(index=columns[0], columns=groupby, values=columns[1])
            return px.imshow(pivot_data, title=title)

        elif viz_type == "correlation":
            corr = df.corr()
            return px.imshow(corr, title=title)

        elif viz_type == "distribution":
            return px.histogram(df, x=columns[0], title=title)

        else:  # Auto or fallback
            return self._generate_fallback_plot(df, title)

    def _generate_fallback_plot(self, df: pd.DataFrame, title: str) -> go.Figure:
        """Generate a fallback plot if no specific type is determined."""
        numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
        categorical_cols = df.select_dtypes(exclude=np.number).columns.tolist()
        
        if categorical_cols and numeric_cols:
            return px.bar(df, x=categorical_cols[0], y=numeric_cols[0], title=f"{title}: {numeric_cols[0]} by {categorical_cols[0]}")
        elif len(numeric_cols) >= 2:
            return px.scatter(df, x=numeric_cols[0], y=numeric_cols[1], title=f"{title}: {numeric_cols[1]} vs {numeric_cols[0]}")
        elif numeric_cols:
            return px.histogram(df, x=numeric_cols[0], title=f"{title}: Distribution of {numeric_cols[0]}")
        elif categorical_cols:
            value_counts = df[categorical_cols[0]].value_counts().reset_index()
            return px.bar(value_counts, x='index', y=categorical_cols[0], title=f"{title}: {categorical_cols[0]} Value Counts")
        else:
            return go.Figure().add_annotation(text="Could not determine appropriate visualization", showarrow=False)

    def _fig_to_html(self, fig: go.Figure) -> str:
        """Convert a Plotly figure to HTML."""
        return fig.to_html(full_html=False, include_plotlyjs='cdn')

# DataInsightTool for generating insights
class DataInsightTool(BaseTool):
    """Tool for generating insights from data."""
    name: str = "insight_tool"
    description: str = "Use this tool to generate insights and summaries from data"
    
    dataframe_tool: Optional[DataFrameTool] = None
    visualization_tool: Optional[DataVisualizationTool] = None
    llm: Optional[Any] = None
    
    def _run(self, query: str) -> str:
        """Generate insights based on the data and query."""
        if self.dataframe_tool is None or self.dataframe_tool.dataframe is None:
            return "No DataFrame is available for insights. Please load data first."
        
        df = self.dataframe_tool.dataframe
        insights = []
        
        # Add data overview
        insights.append(f"# Data Overview\n")
        insights.append(f"Dataset contains {len(df)} rows and {len(df.columns)} columns.")
        
        # Identify column types
        numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        temporal_cols = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        
        insights.append(f"\n## Column Types\n")
        insights.append(f"- Numeric columns ({len(numeric_cols)}): {', '.join(numeric_cols)}")
        insights.append(f"- Categorical columns ({len(categorical_cols)}): {', '.join(categorical_cols)}")
        insights.append(f"- Possible temporal columns ({len(temporal_cols)}): {', '.join(temporal_cols)}")
        
        # Missing values analysis
        missing_cols = df.columns[df.isna().any()].tolist()
        if missing_cols:
            insights.append(f"\n## Missing Values\n")
            for col in missing_cols:
                missing_count = df[col].isna().sum()
                missing_percent = (missing_count / len(df)) * 100
                insights.append(f"- {col}: {missing_count} missing values ({missing_percent:.2f}%)")
        
        # Numeric column statistics
        if numeric_cols:
            insights.append(f"\n## Numeric Column Statistics\n")
            stats_df = df[numeric_cols].describe().T
            insights.append(stats_df.to_string())
            
            # Identify skewed distributions
            skewed_cols = []
            for col in numeric_cols:
                if df[col].skew() > 1 or df[col].skew() < -1:
                    skewed_cols.append(f"{col} (skew: {df[col].skew():.2f})")
            
            if skewed_cols:
                insights.append(f"\n### Skewed Distributions\n")
                insights.append("The following columns have skewed distributions and might benefit from transformation:")
                for col in skewed_cols:
                    insights.append(f"- {col}")
        
        # Categorical column analysis
        if categorical_cols:
            insights.append(f"\n## Categorical Column Analysis\n")
            for col in categorical_cols[:5]:  # Limit to first 5 to avoid overwhelming output
                uniques = df[col].nunique()
                insights.append(f"- {col}: {uniques} unique values")
                
                if uniques <= 10:  # Only show value counts for columns with few unique values
                    value_counts = df[col].value_counts().nlargest(5)
                    insights.append(f"  Top values: {', '.join([f'{k} ({v})' for k, v in value_counts.items()])}")
        
        # Correlation analysis for numeric columns
        if len(numeric_cols) > 1:
            insights.append(f"\n## Correlation Analysis\n")
            corr_matrix = df[numeric_cols].corr()
            
            # Find strong correlations
            strong_corrs = []
            for i, col1 in enumerate(numeric_cols):
                for j, col2 in enumerate(numeric_cols):
                    if i < j:  # Only look at upper triangle of correlation matrix
                        corr = corr_matrix.loc[col1, col2]
                        if abs(corr) > 0.7:  # Threshold for strong correlation
                            strong_corrs.append((col1, col2, corr))
            
            if strong_corrs:
                insights.append("Strong correlations found:")
                for col1, col2, corr in strong_corrs:
                    insights.append(f"- {col1} and {col2}: {corr:.2f}")
            else:
                insights.append("No strong correlations found between numeric columns.")
        
        # Query-specific insights based on keywords
        query_lower = query.lower()
        
        if "outlier" in query_lower or "anomaly" in query_lower:
            insights.append(f"\n## Outlier Analysis\n")
            for col in numeric_cols:
                q1 = df[col].quantile(0.25)
                q3 = df[col].quantile(0.75)
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)][col].count()
                if outliers > 0:
                    pct_outliers = (outliers / len(df)) * 100
                    insights.append(f"- {col}: {outliers} outliers ({pct_outliers:.2f}% of data)")
        
        if "trend" in query_lower and temporal_cols:
            insights.append(f"\n## Trend Analysis\n")
            for date_col in temporal_cols[:1]:  # Use the first temporal column
                try:
                    df[date_col] = pd.to_datetime(df[date_col])
                    df['year_month'] = df[date_col].dt.to_period('M')
                    
                    for num_col in numeric_cols[:3]:  # Analyze first 3 numeric columns
                        trend_data = df.groupby('year_month')[num_col].mean()
                        if len(trend_data) > 1:
                            first_val = trend_data.iloc[0]
                            last_val = trend_data.iloc[-1]
                            change = ((last_val - first_val) / first_val) * 100 if first_val != 0 else float('inf')
                            
                            insights.append(f"- {num_col} over time: {change:.2f}% change from {trend_data.index[0]} to {trend_data.index[-1]}")
                except:
                    insights.append(f"Could not convert {date_col} to datetime for trend analysis.")
        
        if "distribution" in query_lower:
            insights.append(f"\n## Distribution Analysis\n")
            for col in numeric_cols[:5]:  # Analyze first 5 numeric columns
                mean = df[col].mean()
                median = df[col].median()
                skew = df[col].skew()
                
                if abs(skew) < 0.5:
                    dist_type = "approximately normal"
                elif skew > 0:
                    dist_type = "right-skewed"
                else:
                    dist_type = "left-skewed"
                
                insights.append(f"- {col}: {dist_type} distribution (mean: {mean:.2f}, median: {median:.2f}, skew: {skew:.2f})")
        
        if "segment" in query_lower or "group" in query_lower and categorical_cols:
            insights.append(f"\n## Segment Analysis\n")
            for cat_col in categorical_cols[:2]:  # Use first 2 categorical columns
                for num_col in numeric_cols[:3]:  # Analyze with first 3 numeric columns
                    group_stats = df.groupby(cat_col)[num_col].agg(['mean', 'count']).sort_values('mean', ascending=False)
                    insights.append(f"- {num_col} by {cat_col}:")
                    insights.append(group_stats.to_string())
                    insights.append("")
        
        # Create a visualization if available
        if self.visualization_tool is not None:
            try:
                # Determine the best visualization based on data
                if numeric_cols and categorical_cols:
                    viz_query = f"Create a bar chart showing the relationship between {categorical_cols[0]} and {numeric_cols[0]}"
                elif len(numeric_cols) >= 2:
                    viz_query = f"Create a scatter plot of {numeric_cols[0]} vs {numeric_cols[1]}"
                elif numeric_cols:
                    viz_query = f"Create a histogram of {numeric_cols[0]}"
                elif categorical_cols:
                    viz_query = f"Create a pie chart of {categorical_cols[0]}"
                else:
                    viz_query = "Create a summary visualization"
                
                viz_html = self.visualization_tool._run(viz_query)
                insights.append("\n## Visualization\n")
                insights.append(viz_html)
            except Exception as e:
                insights.append("\n## Visualization\n")
                insights.append(f"Could not generate visualization: {str(e)}")
                
        # Add LLM-generated insights if available
        if self.llm is not None and len(df) <= 1000:  # Only for reasonably sized datasets
            try:
                # Create a sample of the data as JSON
                data_sample = df.head(5).to_json(orient='records')
                
                # Generate LLM insights
                llm_prompt = f"""You are a data analyst looking at the following dataset:
                
Column information:
{self.dataframe_tool.dataframe_description}

Here's a sample of the data:
{data_sample}

Based on this information, provide 3-5 key insights about this data that might be interesting or useful.
Focus on patterns, relationships, and potential business implications.
"""
                llm_response = self.llm.invoke(llm_prompt)
                
                insights.append(f"\n## AI-Generated Insights\n")
                insights.append(llm_response.content if hasattr(llm_response, 'content') else str(llm_response))
            except Exception as e:
                insights.append(f"\n## AI-Generated Insights\n")
                insights.append(f"Could not generate AI insights: {str(e)}")
        
        # Provide summary of insights
        insights.append(f"\n## Summary\n")
        insights.append(f"This dataset consists of {len(df)} observations across {len(df.columns)} variables.")
        
        if numeric_cols:
            key_metrics = [f"{col} (avg: {df[col].mean():.2f})" for col in numeric_cols[:3]]
            insights.append(f"Key numeric metrics: {', '.join(key_metrics)}")
        
        if categorical_cols:
            key_categories = [f"{col} ({df[col].nunique()} categories)" for col in categorical_cols[:3]]
            insights.append(f"Key categorical variables: {', '.join(key_categories)}")
        
        return "\n".join(insights)

def create_data_analyst_agent(openai_api_key=None, model_name="gpt-4"):
    """Create and return a data analyst agent."""
    # Initialize tools
    dataframe_tool = DataFrameTool()
    visualization_tool = DataVisualizationTool()
    insight_tool = DataInsightTool()
    
    # Set up tool relationships
    visualization_tool.dataframe_tool = dataframe_tool
    insight_tool.dataframe_tool = dataframe_tool
    insight_tool.visualization_tool = visualization_tool
    
    # Initialize LLM
    llm = ChatOpenAI(
        model_name=model_name,
        temperature=0,
        api_key=openai_api_key
    )
    
    # Set LLM for insight tool
    insight_tool.llm = llm
    
    # Create tool executor using SimpleToolExecutor
    tools = [dataframe_tool, visualization_tool, insight_tool]
    tool_executor = SimpleToolExecutor(tools)  # Use SimpleToolExecutor instead of ToolExecutor
    
    return {
        "dataframe_tool": dataframe_tool,
        "visualization_tool": visualization_tool,
        "insight_tool": insight_tool,
        "tool_executor": tool_executor,
        "llm": llm
    }

# Example usage remains the same...