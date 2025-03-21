import pandas as pd
from langchain.tools import BaseTool
from typing import Optional

class DataFrameTool(BaseTool):
    """Tool for storing and manipulating a pandas DataFrame."""
    name: str = "dataframe_tool"
    description: str = "Use this tool to store and analyze a pandas DataFrame"
    
    dataframe: Optional[pd.DataFrame] = None
    dataframe_name: str = "data"
    dataframe_description: str = ""
    
    def _run(self, query: str) -> str:
        """Execute pandas operations on the stored DataFrame."""
        # Implementation here... 