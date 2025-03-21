import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os
import io
import tempfile
import time
from PIL import Image
from typing import Optional, Dict, Any
from pathlib import Path

# Import agent implementations
from data_analyst_agent import create_data_analyst_agent
from langgraph_agent import create_langgraph_data_analyst_agent

# Constants
SUPPORTED_FORMATS = {
    "csv": ["csv"],
    "excel": ["xlsx", "xls"],
    "image": ["jpg", "jpeg", "png"],
    "document": ["pdf", "docx"]
}
ALL_FORMATS = [fmt for formats in SUPPORTED_FORMATS.values() for fmt in formats]

class StreamlitApp:
    """Main Streamlit application class"""
    
    def __init__(self):
        self._configure_page()
        self._initialize_session_state()
        self._apply_custom_css()
    
    def _configure_page(self):
        """Configure Streamlit page settings"""
        st.set_page_config(
            page_title="Data Analyst AI Assistant",
            page_icon="📊",
            layout="wide",
            initial_sidebar_state="expanded"
        )
    
    def _initialize_session_state(self):
        """Initialize session state variables"""
        defaults = {
            'agent': None,
            'data_loaded': False,
            'df': None,
            'chat_history': [],
            'file_details': None,
            'temp_file_path': None,
            'current_analysis': None,
            'visualization_history': []
        }
        for key, value in defaults.items():
            if key not in st.session_state:
                st.session_state[key] = value
    
    def _apply_custom_css(self):
        """Apply custom CSS styling"""
        st.markdown("""
        <style>
            .main .block-container { padding-top: 2rem; }
            .stTabs [data-baseweb="tab-panel"] { padding-top: 1rem; }
            .chat-message {
                padding: 1rem;
                border-radius: 0.5rem;
                margin-bottom: 1rem;
                display: flex;
            }
            .chat-message.user { background-color: #f0f2f6; }
            .chat-message.assistant { background-color: #e6f7ff; }
            .visualization-container {
                background-color: white;
                border-radius: 0.5rem;
                padding: 1rem;
                margin: 1rem 0;
                border: 1px solid #f0f2f6;
            }
        </style>
        """, unsafe_allow_html=True)
    
    def render_sidebar(self):
        """Render sidebar with settings and configuration"""
        with st.sidebar:
            st.header("Settings")
            
            # API Key management
            api_key = st.text_input("OpenAI API Key", type="password")
            if api_key:
                os.environ["OPENAI_API_KEY"] = api_key
            
            # Model selection
            model = st.selectbox(
                "Select Model",
                ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
                index=1
            )
            
            # Agent selection
            agent_type = st.radio(
                "Agent Implementation",
                ["LangChain Agent", "LangGraph Agent"],
                index=0
            )
            
            if st.button("Initialize/Update Agent"):
                self._initialize_agent(api_key, model, agent_type)
            
            self._render_help_section()
    
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
                st.session_state.agent = agent_creator(
                    openai_api_key=api_key,
                    model_name=model
                )
                st.success("Agent initialized successfully!")
            except Exception as e:
                st.error(f"Error initializing agent: {str(e)}")
    
    def _render_help_section(self):
        """Render help section in sidebar"""
        with st.expander("Usage Tips", expanded=False):
            st.markdown("""
            **Getting Started:**
            1. Enter your OpenAI API key
            2. Select your preferred model
            3. Initialize the agent
            4. Upload a data file
            5. Ask questions about your data

            **Example Questions:**
            - Summarize this dataset
            - Show a chart of sales over time
            - What's the correlation between X and Y?
            - Find outliers in the data
            - What insights can you provide?
            """)
    
    def render_data_upload_tab(self):
        """Render data upload tab"""
        st.header("Upload Your Data")
        
        uploaded_file = st.file_uploader(
            "Upload your data file",
            type=ALL_FORMATS
        )
        
        if uploaded_file:
            self._process_uploaded_file(uploaded_file)
    
    def _process_uploaded_file(self, uploaded_file):
        """Process the uploaded file and initialize the agent"""
        try:
            # Create temporary file
            suffix = Path(uploaded_file.name).suffix
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                tmp_file.write(uploaded_file.getvalue())
                st.session_state.temp_file_path = tmp_file.name
            
            # Process file with agent
            if st.session_state.agent is None:
                st.warning("Please initialize the agent first.")
                return
            
            with st.spinner("Processing data..."):
                result = st.session_state.agent.load_data_from_file(
                    st.session_state.temp_file_path
                )
                
                if isinstance(result, str) and "error" in result.lower():
                    st.error(result)
                    return
                
                st.session_state.data_loaded = True
                st.success("Data loaded successfully!")
                st.markdown(result)
        
        except Exception as e:
            st.error(f"Error processing file: {str(e)}")
            st.session_state.data_loaded = False
    
    def render_data_preview_tab(self):
        """Render data preview tab"""
        if not st.session_state.data_loaded:
            st.info("Please upload data first.")
            return
        
        if hasattr(st.session_state.agent, 'dataframe_tool'):
            df = st.session_state.agent.dataframe_tool.dataframe
            if df is not None:
                st.dataframe(df)
                self._render_data_statistics(df)
    
    def render_analysis_tab(self):
        """Render analysis tab"""
        if not st.session_state.data_loaded:
            st.info("Please upload data first.")
            return
        
        analysis_type = st.selectbox(
            "Select Analysis Type",
            ["Basic Statistics", "Time Series Analysis", "Custom Analysis"]
        )
        
        analysis_methods = {
            "Basic Statistics": self._render_basic_statistics,
            "Time Series Analysis": self._render_time_series_analysis,
            "Custom Analysis": self._render_custom_analysis
        }
        
        analysis_methods[analysis_type]()
    
    def render_chat_tab(self):
        """Render chat interface tab"""
        st.header("Chat with Data Analyst AI")
        
        if not st.session_state.data_loaded:
            st.info("Please upload data first.")
            return
        
        # Display chat history
        for message in st.session_state.chat_history:
            with st.chat_message(message["role"]):
                st.markdown(message["content"], unsafe_allow_html=True)
        
        # Chat input
        user_input = st.chat_input("Ask about your data...")
        if user_input:
            self._process_chat_input(user_input)
    
    def _cleanup_temp_files(self):
        """Clean up any temporary files created during the session"""
        if st.session_state.temp_file_path and os.path.exists(st.session_state.temp_file_path):
            try:
                os.unlink(st.session_state.temp_file_path)
                st.session_state.temp_file_path = None
            except Exception as e:
                if self.verbose:
                    print(f"Error cleaning up temporary file: {e}")

    def run(self):
        """Run the Streamlit application"""
        st.title("Data Analyst AI Assistant")
        st.markdown("""
        This application uses AI to help you analyze your data and generate insights. 
        Upload your data file, explore it visually, and chat with the AI assistant.
        """)
        
        self.render_sidebar()
        
        # Main content tabs
        tabs = st.tabs(["Data Upload", "Data Preview", "Analysis", "Chat"])
        with tabs[0]: self.render_data_upload_tab()
        with tabs[1]: self.render_data_preview_tab()
        with tabs[2]: self.render_analysis_tab()
        with tabs[3]: self.render_chat_tab()
        
        self._cleanup_temp_files()

if __name__ == "__main__":
    app = StreamlitApp()
    app.run()