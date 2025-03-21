import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from langchain.tools import BaseTool
from typing import Optional, Any

class DataFrameTool(BaseTool):
    """Tool for storing and manipulating a pandas DataFrame."""
    name: str = "dataframe_tool"
    description: str = "Use this tool to store and analyze a pandas DataFrame"
    
    dataframe: Optional[pd.DataFrame] = None
    dataframe_name: str = "data"
    dataframe_description: str = ""
    
    def _run(self, query: str) -> str:
        """Execute pandas operations on the stored DataFrame."""
        if self.dataframe is None:
            return "No DataFrame is loaded. Please load data first."
        # (Implement your pandas-based operations here.)
        return "DataFrame operation executed."

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
            # Parse the query, create visualization, and convert figure to HTML.
            viz_type, params = self._parse_visualization_query(query)
            fig = self._create_visualization(df, viz_type, params)
            return self._fig_to_html(fig)
        except Exception as e:
            return f"Error creating visualization: {str(e)}"
    
    def _parse_visualization_query(self, query: str) -> tuple:
        query = query.lower()
        params = {"title": "Data Visualization"}
        viz_types = ["bar", "histogram", "scatter", "line", "pie", "box", "heatmap", "correlation", "distribution", "summary"]
        for viz in viz_types:
            if viz in query:
                viz_type = viz
                break
        else:
            viz_type = "auto"
        params["columns"] = [col for col in self.dataframe_tool.dataframe.columns if col.lower() in query]
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

    def _create_visualization(self, df: pd.DataFrame, viz_type: str, params: dict) -> go.Figure:
        columns = params.get("columns", [])
        title = params.get("title", "Data Visualization")
        groupby = params.get("groupby", None)
        if not columns:
            numeric_cols = df.select_dtypes(include="number").columns.tolist()
            categorical_cols = df.select_dtypes(exclude="number").columns.tolist()
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
        if viz_type == "bar":
            if len(columns) >= 2 and groupby is None:
                fig = px.bar(df, x=columns[0], y=columns[1], title=title)
            elif groupby is not None:
                fig = px.bar(df, x=columns[0], color=groupby, title=title)
            else:
                col = columns[0] if columns else df.columns[0]
                value_counts = df[col].value_counts().reset_index()
                fig = px.bar(value_counts, x='index', y=col, title=f"{title}: {col} Value Counts")
        elif viz_type == "histogram":
            fig = px.histogram(df, x=columns[0], title=f"{title}: Distribution of {columns[0]}") if columns else px.histogram(df)
        elif viz_type == "scatter":
            fig = px.scatter(df, x=columns[0], y=columns[1], title=f"{title}: {columns[1]} vs {columns[0]}") if len(columns) > 1 else px.scatter(df, x=columns[0])
        elif viz_type == "line":
            fig = px.line(df, x=columns[0], y=columns[1], title=title) if len(columns) > 1 else px.line(df, x=columns[0])
        elif viz_type == "pie":
            fig = px.pie(df, names=columns[0], values=columns[1], title=title) if len(columns) > 1 else px.pie(df, names=columns[0])
        elif viz_type == "box":
            fig = px.box(df, y=columns[0], title=title)
        elif viz_type == "heatmap":
            pivot_data = df.pivot(index=columns[0], columns=groupby, values=columns[1])
            fig = px.imshow(pivot_data, title=title)
        elif viz_type == "correlation":
            corr = df.corr()
            fig = px.imshow(corr, title=title)
        elif viz_type == "distribution":
            fig = px.histogram(df, x=columns[0], title=title)
        else:
            fig = self._generate_fallback_plot(df, title)
        fig.update_layout(
            title=title,
            template="plotly_white",
            margin=dict(l=50, r=50, t=80, b=50),
            height=600,
            width=900
        )
        return fig

    def _generate_fallback_plot(self, df: pd.DataFrame, title: str) -> go.Figure:
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        categorical_cols = df.select_dtypes(exclude="number").columns.tolist()
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
        return fig.to_html(full_html=False, include_plotlyjs='cdn')

# DataInsightTool for generating insights
class DataInsightTool(BaseTool):
    """Tool for generating insights and summaries from data."""
    name: str = "insight_tool"
    description: str = "Use this tool to generate insights and summaries from data"
    
    dataframe_tool: Optional[DataFrameTool] = None
    visualization_tool: Optional[DataVisualizationTool] = None
    llm: Optional[Any] = None
    
    def _run(self, query: str) -> str:
        if self.dataframe_tool is None or self.dataframe_tool.dataframe is None:
            return "No DataFrame is available for insights. Please load data first."
        
        df = self.dataframe_tool.dataframe
        insights = []
        insights.append("# Data Overview\n")
        insights.append(f"Dataset contains {len(df)} rows and {len(df.columns)} columns.")
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
        temporal_cols = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        insights.append("\n## Column Types\n")
        insights.append(f"- Numeric columns ({len(numeric_cols)}): {', '.join(numeric_cols)}")
        insights.append(f"- Categorical columns ({len(categorical_cols)}): {', '.join(categorical_cols)}")
        insights.append(f"- Possible temporal columns ({len(temporal_cols)}): {', '.join(temporal_cols)}")
        missing_cols = df.columns[df.isna().any()].tolist()
        if missing_cols:
            insights.append("\n## Missing Values\n")
            for col in missing_cols:
                missing_count = df[col].isna().sum()
                missing_percent = (missing_count / len(df)) * 100
                insights.append(f"- {col}: {missing_count} missing values ({missing_percent:.2f}%)")
        if numeric_cols:
            insights.append("\n## Numeric Column Statistics\n")
            stats_df = df[numeric_cols].describe().T
            insights.append(stats_df.to_string())
        if categorical_cols:
            insights.append("\n## Categorical Column Analysis\n")
            for col in categorical_cols[:5]:
                uniques = df[col].nunique()
                insights.append(f"- {col}: {uniques} unique values")
        insights.append(f"\n## Summary\n")
        insights.append(f"This dataset consists of {len(df)} observations across {len(df.columns)} variables.")
        if numeric_cols:
            key_metrics = [f"{col} (avg: {df[col].mean():.2f})" for col in numeric_cols[:3]]
            insights.append(f"Key numeric metrics: {', '.join(key_metrics)}")
        if categorical_cols:
            key_categories = [f"{col} ({df[col].nunique()} categories)" for col in categorical_cols[:3]]
            insights.append(f"Key categorical variables: {', '.join(key_categories)}")
        return "\n".join(insights) 