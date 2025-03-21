import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import streamlit as st
import json
import io
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

class EnhancedChatFunctionality:
    """
    Enhanced chat functionality with visualization capabilities.
    Can be integrated into the main data agent application.
    """
    
    def __init__(self):
        """Initialize the enhanced chat functionality"""
        # Initialize any required attributes
        pass
    
    def analyze_with_llm(self, df, query, chat_history=None, llm=None):
        """
        Analyze data with LLM and generate visualization code
        
        Args:
            df: DataFrame to analyze
            query: User query
            chat_history: Optional chat history
            llm: Optional LLM instance
            
        Returns:
            Dictionary with insight and visualization code
        """
        # Create a data summary for context
        buffer = io.StringIO()
        df.info(buf=buffer)
        df_info = buffer.getvalue()
        
        # Get sample data as string
        sample_data = df.head(5).to_string()
        
        # Get basic stats
        basic_stats = df.describe().to_string()
        
        # Create column list with data types
        columns_info = "\n".join([f"- {col}: {df[col].dtype}" for col in df.columns])
        
        # Format conversation history
        conversation_history = ""
        if chat_history:
            for message in chat_history:
                role = "Human" if message["role"] == "user" else "Assistant"
                conversation_history += f"{role}: {message['content']}\n"
        
        # Create a prompt template with conversation history
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
        
        CONVERSATION HISTORY:
        {conversation_history}
        
        USER QUERY: {query}
        
        Based on the data provided, the conversation history, and the user's query, please provide:
        1. A clear insight or answer to the query
        2. Python code using matplotlib or seaborn to create a relevant visualization (if appropriate)
        
        Return your response in the following JSON format:
        {{
            "insight": "Your detailed answer/insight here",
            "visualization_code": "Python code for visualization (if applicable, otherwise empty string)",
            "visualization_type": "Type of visualization (bar, line, scatter, etc.) or None"
        }}
        
        Make sure the visualization code is complete, uses matplotlib or seaborn, and can run with the variable 'df' as the DataFrame.
        If the user is referring to previous visualizations or asking follow-up questions, use the conversation history for context.
        """
        
        prompt = PromptTemplate(
            input_variables=["df_info", "columns_info", "sample_data", "basic_stats", "conversation_history", "query"],
            template=template,
        )
        
        # Initialize the LLM if not provided
        if not llm:
            llm = ChatOpenAI(
                temperature=0.2, 
                model="gpt-4",
                api_key=os.environ.get("OPENAI_API_KEY")
            )
        
        # Create and run the chain
        chain = LLMChain(llm=llm, prompt=prompt)
        response = chain.run(
            df_info=df_info,
            columns_info=columns_info,
            sample_data=sample_data,
            basic_stats=basic_stats,
            conversation_history=conversation_history,
            query=query
        )
        
        # Parse the response
        try:
            # Find JSON content within the response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
            else:
                # Fallback if JSON not properly formatted
                result = {
                    "insight": response,
                    "visualization_code": "",
                    "visualization_type": None
                }
            return result
        except Exception as e:
            print(f"Error parsing response: {e}")
            return {
                "insight": response,
                "visualization_code": "",
                "visualization_type": None
            }
    
    def create_visualization(self, code, df):
        """
        Execute visualization code safely and return the figure
        
        Args:
            code: String containing Python code to execute
            df: DataFrame to use in visualization
            
        Returns:
            matplotlib figure or None if error
        """
        try:
            # Create a new figure
            plt.figure(figsize=(10, 6))
            
            # Execute the code with the dataframe
            exec(code, {"df": df, "plt": plt, "sns": sns, "pd": pd})
            
            # Return the figure
            return plt.gcf()
        except Exception as e:
            print(f"Error in visualization: {e}")
            return None

    def render_chat_interface(self, df, llm=None):
        """
        Render a Streamlit chat interface for analyzing the DataFrame
        
        Args:
            df: DataFrame to analyze
            llm: Optional LLM instance
        """
        st.title("Data Analysis Chat")
        st.write("Ask questions about your data and get insights with visualizations!")
        
        # Initialize chat history
        if "enhanced_chat_history" not in st.session_state:
            st.session_state.enhanced_chat_history = []
        
        # Chat container
        chat_container = st.container()
        
        # Display chat history
        with chat_container:
            for message in st.session_state.enhanced_chat_history:
                with st.chat_message(message["role"]):
                    st.write(message["content"])
                    if "visualization" in message and message["visualization"]:
                        st.pyplot(message["visualization"])
                    if "visualization_code" in message and message["visualization_code"]:
                        with st.expander("View Visualization Code"):
                            st.code(message["visualization_code"], language="python")
        
        # Chat input
        query = st.chat_input("Ask a question about your data:")
        
        if query:
            # Add user message to chat history
            st.session_state.enhanced_chat_history.append({"role": "user", "content": query})
            
            # Display user message
            with st.chat_message("user"):
                st.write(query)
            
            # Display assistant response with spinner
            with st.chat_message("assistant"):
                with st.spinner("Analyzing your data..."):
                    # Get analysis from LLM
                    result = self.analyze_with_llm(
                        df, 
                        query, 
                        st.session_state.enhanced_chat_history,
                        llm
                    )
                    
                    # Display insight
                    st.write(result["insight"])
                    
                    # Store visualization in message
                    visualization = None
                    
                    # Display visualization if available
                    if result["visualization_code"] and result["visualization_code"].strip():
                        # Create and display visualization
                        fig = self.create_visualization(result["visualization_code"], df)
                        if fig:
                            st.pyplot(fig)
                            visualization = fig
                        
                        # Show the code
                        with st.expander("View Visualization Code"):
                            st.code(result["visualization_code"], language="python")
            
            # Add assistant response to chat history
            st.session_state.enhanced_chat_history.append({
                "role": "assistant", 
                "content": result["insight"],
                "visualization": visualization,
                "visualization_code": result["visualization_code"] if "visualization_code" in result else ""
            })
            
            # Force a rerun to update the chat interface
            st.rerun()
        
        # Reset conversation button
        if st.session_state.enhanced_chat_history:
            if st.button("Reset Conversation"):
                st.session_state.enhanced_chat_history = []
                st.rerun()

# Example standalone usage
if __name__ == "__main__":
    st.set_page_config(page_title="Enhanced Data Chat", layout="wide")
    
    # Sample data
    sample_data = {
        'date': ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05'],
        'sales': [1000, 1200, 900, 1500, 1800],
        'expenses': [700, 750, 800, 850, 900],
        'profit': [300, 450, 100, 650, 900]
    }
    df = pd.DataFrame(sample_data)
    
    # API key input
    api_key = st.sidebar.text_input("OpenAI API Key:", type="password")
    if api_key:
        os.environ["OPENAI_API_KEY"] = api_key
    
    # Initialize chat functionality
    chat = EnhancedChatFunctionality()
    
    # Display chat interface
    if api_key:
        chat.render_chat_interface(df)
    else:
        st.info("Please enter your OpenAI API key in the sidebar to start chatting.") 