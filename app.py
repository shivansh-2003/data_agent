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
from agent_base import BaseDataAnalystAgent

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
        # Type hint for agent
        self.agent: Optional[BaseDataAnalystAgent] = None
    
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
        
        # Chat history container with automatic scrolling
        chat_container = st.container()
        
        # Display chat history
        with chat_container:
            for message in st.session_state.chat_history:
                if message['role'] == 'user':
                    st.markdown(f"""
                    <div class='chat-message user'>
                        <div class='chat-icon'>👤</div>
                        <div class='chat-content'>{message['content']}</div>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div class='chat-message assistant'>
                        <div class='chat-icon'>🤖</div>
                        <div class='chat-content'>{message['content']}</div>
                    </div>
                    """, unsafe_allow_html=True)
        
        # Add custom JavaScript for auto-scrolling
        st.markdown("""
        <script>
        // Scroll to the bottom of the chat container
        function scrollToBottom() {
            var chatContainer = window.parent.document.querySelector('.stContainer');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
        scrollToBottom();
        </script>
        """, unsafe_allow_html=True)
        
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

    def _render_data_statistics(self, df: pd.DataFrame):
        """Render basic statistics for the DataFrame"""
        st.subheader("Data Statistics")
        
        # Tabs for different types of statistics
        stats_tabs = st.tabs(["Summary", "Descriptive Stats", "Column Details"])
        
        with stats_tabs[0]:
            # Basic summary
            st.markdown("### Dataset Overview")
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Total Rows", len(df))
            with col2:
                st.metric("Total Columns", len(df.columns))
            with col3:
                st.metric("Memory Usage", f"{df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
        
        with stats_tabs[1]:
            # Descriptive statistics
            st.markdown("### Descriptive Statistics")
            numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
            if not numeric_cols.empty:
                st.dataframe(df[numeric_cols].describe())
            else:
                st.info("No numeric columns found for descriptive statistics.")
        
        with stats_tabs[2]:
            # Column details
            st.markdown("### Column Details")
            column_details = []
            for col in df.columns:
                dtype = str(df[col].dtype)
                missing = df[col].isna().sum()
                missing_pct = (missing / len(df)) * 100
                unique = df[col].nunique()
                
                column_details.append({
                    "Column": col,
                    "Data Type": dtype,
                    "Missing Values": f"{missing} ({missing_pct:.2f}%)",
                    "Unique Values": unique
                })
            
            st.dataframe(pd.DataFrame(column_details))

    def _render_basic_statistics(self):
        """Render basic statistical analysis"""
        if not st.session_state.data_loaded:
            st.info("Please upload data first.")
            return
        
        if hasattr(st.session_state.agent, 'dataframe_tool'):
            df = st.session_state.agent.dataframe_tool.dataframe
            if df is not None:
                # Reuse the data statistics rendering
                self._render_data_statistics(df)

    def _render_time_series_analysis(self):
        """Render time series analysis"""
        if not st.session_state.data_loaded:
            st.info("Please upload data first.")
            return
        
        if hasattr(st.session_state.agent, 'dataframe_tool'):
            df = st.session_state.agent.dataframe_tool.dataframe
            if df is not None:
                st.subheader("Time Series Analysis")
                
                # Identify potential time columns
                time_cols = df.select_dtypes(include=['datetime64']).columns
                if len(time_cols) == 0:
                    # Try to convert columns to datetime
                    for col in df.columns:
                        try:
                            df[col] = pd.to_datetime(df[col])
                            time_cols = [col]
                            break
                        except:
                            pass
                
                if len(time_cols) > 0:
                    time_col = time_cols[0]
                    
                    # Select numeric column for analysis
                    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
                    
                    if len(numeric_cols) > 0:
                        # Allow user to select numeric column
                        analysis_col = st.selectbox(
                            "Select column for time series analysis", 
                            numeric_cols.tolist()
                        )
                        
                        # Resample and plot
                        st.subheader(f"Time Series of {analysis_col}")
                        df.set_index(time_col, inplace=True)
                        
                        # Resample options
                        resample_options = {
                            "Daily": 'D',
                            "Weekly": 'W',
                            "Monthly": 'M',
                            "Quarterly": 'Q',
                            "Yearly": 'Y'
                        }
                        resample_freq = st.selectbox(
                            "Select resampling frequency", 
                            list(resample_options.keys())
                        )
                        
                        # Perform resampling
                        resampled_data = df[analysis_col].resample(resample_options[resample_freq]).mean()
                        
                        # Plot
                        fig = px.line(
                            x=resampled_data.index, 
                            y=resampled_data.values, 
                            title=f"{analysis_col} Over Time ({resample_freq})"
                        )
                        st.plotly_chart(fig)
                        
                        # Additional time series insights
                        st.subheader("Time Series Insights")
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("Mean", f"{resampled_data.mean():.2f}")
                        with col2:
                            st.metric("Minimum", f"{resampled_data.min():.2f}")
                        with col3:
                            st.metric("Maximum", f"{resampled_data.max():.2f}")
                    else:
                        st.warning("No numeric columns found for time series analysis.")
                else:
                    st.warning("No time-based columns found in the dataset.")

    def _render_custom_analysis(self):
        """Render custom analysis options"""
        if not st.session_state.data_loaded:
            st.info("Please upload data first.")
            return
        
        if hasattr(st.session_state.agent, 'dataframe_tool'):
            df = st.session_state.agent.dataframe_tool.dataframe
            if df is not None:
                st.subheader("Custom Analysis")
                
                # Analysis type selection
                analysis_type = st.selectbox(
                    "Select Analysis Type",
                    [
                        "Correlation Matrix", 
                        "Distribution of Numeric Columns", 
                        "Categorical Column Analysis"
                    ]
                )
                
                if analysis_type == "Correlation Matrix":
                    # Correlation matrix
                    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
                    if len(numeric_cols) > 1:
                        corr_matrix = df[numeric_cols].corr()
                        fig = px.imshow(
                            corr_matrix, 
                            text_auto=True, 
                            title="Correlation Matrix of Numeric Columns"
                        )
                        st.plotly_chart(fig)
                    else:
                        st.warning("Not enough numeric columns for correlation analysis.")
                
                elif analysis_type == "Distribution of Numeric Columns":
                    # Distribution of numeric columns
                    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
                    selected_cols = st.multiselect(
                        "Select columns to analyze", 
                        numeric_cols.tolist()
                    )
                    
                    if selected_cols:
                        fig = go.Figure()
                        for col in selected_cols:
                            fig.add_trace(go.Histogram(
                                x=df[col], 
                                name=col, 
                                opacity=0.7  # Use opacity in marker
                            ))
                        
                        fig.update_layout(
                            title="Distribution of Selected Columns", 
                            barmode='overlay'  # Change this instead of opacity in update_layout
                        )
                        st.plotly_chart(fig)
                    else:
                        st.warning("Please select columns to analyze.")
                
                elif analysis_type == "Categorical Column Analysis":
                    # Categorical column analysis
                    cat_cols = df.select_dtypes(include=['object', 'category']).columns
                    selected_col = st.selectbox(
                        "Select categorical column", 
                        cat_cols.tolist()
                    )
                    
                    if selected_col:
                        value_counts = df[selected_col].value_counts()
                        fig = px.pie(
                            values=value_counts.values, 
                            names=value_counts.index, 
                            title=f"Distribution of {selected_col}"
                        )
                        st.plotly_chart(fig)
                        
                        # Display value counts
                        st.dataframe(value_counts)

    def _process_chat_input(self, user_input: str):
        """Process user chat input and interact with the AI agent"""
        # Validate that an agent and data are loaded
        if not st.session_state.data_loaded or st.session_state.agent is None:
            st.error("Please load data before chatting.")
            return
        
        # Trim and validate input
        user_input = user_input.strip()
        if not user_input:
            st.warning("Please enter a valid message.")
            return
        
        try:
            # Add user message to chat history
            st.session_state.chat_history.append({
                "role": "user", 
                "content": user_input
            })
            
            # Use the agent's query method to get a response
            with st.spinner("Generating response..."):
                response = st.session_state.agent.query(user_input)
            
            # Add AI response to chat history
            st.session_state.chat_history.append({
                "role": "assistant", 
                "content": response
            })
            
            # Limit chat history to prevent memory issues
            if len(st.session_state.chat_history) > 20:
                st.session_state.chat_history = st.session_state.chat_history[-20:]
            
            # Instead of rerun or JavaScript, force a rerun
            st.rerun()
        
        except Exception as e:
            st.error(f"Error processing chat input: {str(e)}")
            # Log the error
            import traceback
            traceback.print_exc()

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