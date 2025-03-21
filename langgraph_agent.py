import os
from typing import Dict, List, Any, Annotated, Sequence, TypedDict, Union
import operator
import pandas as pd
import numpy as np

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import Runnable, RunnableConfig
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

from langgraph.graph import StateGraph, END
from data_tools import DataFrameTool, DataVisualizationTool, DataInsightTool
from ingestion import DataIngestion
from agent_base import BaseDataAnalystAgent

# Define the state schema
class AgentState(TypedDict):
    """State definition for the LangGraph agent"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    current_tool: str
    current_query: str
    dataframe: Any
    dataframe_loaded: bool

class SimpleToolExecutor:
    """Simple replacement for ToolExecutor"""
    def __init__(self, tools: List[BaseTool]):
        self.tools = {tool.name: tool for tool in tools}
    
    def invoke(self, tool_input: Dict[str, str]) -> str:
        """Execute the specified tool with the given input"""
        tool_name = tool_input.get("name")
        tool_args = tool_input.get("input")
        
        if tool_name not in self.tools:
            return f"Error: Tool '{tool_name}' not found"
        
        try:
            return self.tools[tool_name]._run(tool_args)
        except Exception as e:
            return f"Error executing {tool_name}: {str(e)}"

# Function to initialize LLM
def get_llm(openai_api_key=None, model_name="gpt-4"):
    """Initialize a LangChain ChatOpenAI instance with the given API key and model name."""
    return ChatOpenAI(
        model_name=model_name,
        temperature=0,
        api_key=openai_api_key
    )

class LangGraphDataAnalystAgent(BaseDataAnalystAgent):
    """
    Data Analyst Agent implemented with LangGraph.
    Uses a graph-based approach for better state management and routing.
    """
    
    def __init__(self, openai_api_key=None, model_name="gpt-4"):
        """Initialize the agent with the LangGraph workflow."""
        self.openai_api_key = openai_api_key
        self.model_name = model_name
        
        # Initialize tools
        self.dataframe_tool = DataFrameTool()
        self.visualization_tool = DataVisualizationTool()
        self.visualization_tool.dataframe_tool = self.dataframe_tool
        self.insight_tool = DataInsightTool()
        self.insight_tool.dataframe_tool = self.dataframe_tool
        self.insight_tool.visualization_tool = self.visualization_tool
        
        # Set LLM for insight tool
        self.llm = get_llm(openai_api_key, model_name)
        self.insight_tool.llm = self.llm
        
        # Initialize data ingestion
        self.data_ingestion = DataIngestion(verbose=False)
        
        # Create tool executor
        self.tools = [self.dataframe_tool, self.visualization_tool, self.insight_tool]
        self.tool_executor = SimpleToolExecutor(self.tools)
        
        # Create graph
        self.graph = self._create_graph()
        
        # Initialize state
        self.state = {
            "messages": [],
            "current_tool": "",
            "current_query": "",
            "dataframe": None,
            "dataframe_loaded": False
        }
    
    def _create_graph(self):
        """Create the LangGraph workflow for data analysis."""
        graph = StateGraph(AgentState)
        
        # Add nodes
        nodes = [
            "check_data_loaded", "process_data_loading", "request_data",
            "route_to_tool", "dataframe_tool", "visualization_tool",
            "insight_tool", "human"
        ]
        for node in nodes:
            graph.add_node(node, getattr(self, f"_{node}"))

        # Add edges
        graph.add_edge("check_data_loaded", "process_data_loading")
        graph.add_edge("check_data_loaded", "request_data")
        graph.add_edge("check_data_loaded", "route_to_tool")
        graph.add_edge("route_to_tool", "dataframe_tool")
        graph.add_edge("route_to_tool", "visualization_tool")
        graph.add_edge("route_to_tool", "insight_tool") 
        graph.add_edge("route_to_tool", "human")
        graph.add_edge("dataframe_tool", END)
        graph.add_edge("visualization_tool", END)
        graph.add_edge("insight_tool", END)
        graph.add_edge("human", END)
        graph.add_edge("process_data_loading", END)
        graph.add_edge("request_data", END)
        
        # Set the entry point
        graph.set_entry_point("check_data_loaded")
        
        return graph.compile()
    
    def _check_data_loaded(self, state: AgentState):
        """Check if data is loaded and route accordingly."""
        if not state["dataframe_loaded"]:
            if any(keyword in state["current_query"].lower() for keyword in ["load", "import", "csv"]):
                return "process_data_loading"
            return "request_data"
        return "route_to_tool"
    
    def _process_data_loading(self, state: AgentState):
        """Process a request to load data."""
        message = "I can help you load data. Please upload a CSV, Excel, or other data file, or provide the data directly."
        return {"messages": state["messages"] + [AIMessage(content=message)]}
    
    def _request_data(self, state: AgentState):
        """Request the user to load data first."""
        return {"messages": state["messages"] + [AIMessage(content="I need data to work with. Please upload a CSV, Excel, or other data file, or provide data directly.")]}
    
    def _route_to_tool(self, state: AgentState):
        """Route the query to the appropriate tool."""
        query = state["current_query"]
        
        # Prepare prompt for tool selection
        system_prompt = """You are a data analysis assistant that helps users analyze data.
        Determine which tool is most appropriate for the current query, and respond with ONLY the tool name.
        
        Choose from:
        - "dataframe_tool": For data manipulation, calculations, and basic analysis
        - "visualization_tool": For creating charts and visualizations
        - "insight_tool": For generating insights, summaries, and explanations
        - "human": If you can answer directly or need clarification
        
        Choose the most appropriate tool based on the query. Respond with JUST the tool name (e.g., "dataframe_tool").
        """
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Which tool should I use for this query: {query}")
        ])
        
        response = self.llm.invoke(prompt.format_messages())
        
        tool_name = response.content.strip().lower()
        if "dataframe" in tool_name:
            return "dataframe_tool"
        elif any(keyword in tool_name for keyword in ["visualization", "chart", "plot"]):
            return "visualization_tool"
        elif any(keyword in tool_name for keyword in ["insight", "summary", "analyze"]):
            return "insight_tool"
        return "human"
    
    def _execute_dataframe_tool(self, state: AgentState):
        """Execute the dataframe tool."""
        query = state["current_query"]
        
        try:
            response = self.tool_executor.invoke({"name": "dataframe_tool", "input": query})
            return {"messages": state["messages"] + [AIMessage(content=response)]}
        except Exception as e:
            return {"messages": state["messages"] + [AIMessage(content=f"Error executing dataframe operation: {str(e)}")]}
    
    def _execute_visualization_tool(self, state: AgentState):
        """Execute the visualization tool."""
        query = state["current_query"]
        
        try:
            response = self.tool_executor.invoke({"name": "visualization_tool", "input": query})
            return {"messages": state["messages"] + [AIMessage(content=response)]}
        except Exception as e:
            return {"messages": state["messages"] + [AIMessage(content=f"Error creating visualization: {str(e)}")]}
    
    def _execute_insight_tool(self, state: AgentState):
        """Execute the insight tool."""
        query = state["current_query"]
        
        try:
            response = self.tool_executor.invoke({"name": "insight_tool", "input": query})
            return {"messages": state["messages"] + [AIMessage(content=response)]}
        except Exception as e:
            return {"messages": state["messages"] + [AIMessage(content=f"Error generating insights: {str(e)}")]}
    
    def _human_response(self, state: AgentState):
        """Generate a direct response using the LLM."""
        query = state["current_query"]
        messages = state["messages"]
        
        # Prepare prompt
        system_prompt = """You are a data analysis assistant that helps users analyze data.
        Answer the user's query directly based on your knowledge and the conversation history.
        If you're unsure or need data that hasn't been provided, let the user know what you need.
        """
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=system_prompt),
            MessagesPlaceholder(variable_name="history"),
            HumanMessage(content=query)
        ])
        
        # Extract just the content for history
        history = [{"role": "user" if isinstance(msg, HumanMessage) else "assistant", 
                    "content": msg.content} 
                   for msg in messages]
        
        response = self.llm.invoke(prompt.format(history=history))
        
        return {"messages": state["messages"] + [AIMessage(content=response.content)]}
    
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
            self.dataframe_tool.dataframe_description = self.dataframe_tool._generate_df_description()
            
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
            self.dataframe_tool.dataframe_description = self.dataframe_tool._generate_df_description()
            
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
    
    def query(self, user_input):
        """Process a user query through the LangGraph agent."""
        try:
            # Add user message to history
            self.state["messages"].append(HumanMessage(content=user_input))
            
            # Set current query
            self.state["current_query"] = user_input
            
            # Run the graph
            result = self.graph.invoke(self.state)
            
            # Update state with result
            self.state = result
            
            # Return the last message
            if result["messages"]:
                return result["messages"][-1].content
            return "No response generated."
        except Exception as e:
            return f"Error processing query: {str(e)}"

def create_langgraph_data_analyst_agent(openai_api_key=None, model_name="gpt-4"):
    """Create and return a LangGraph data analyst agent."""
    return LangGraphDataAnalystAgent(openai_api_key=openai_api_key, model_name=model_name)

# Example usage
if __name__ == "__main__":
    import os
    import io
    
    # Get API key from environment variable
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    
    # Create agent
    agent = create_langgraph_data_analyst_agent(openai_api_key=openai_api_key)
    
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