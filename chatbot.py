import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import streamlit as st
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.memory.chat_message_histories import StreamlitChatMessageHistory
import json
from io import StringIO
import tempfile
from ingestion import DataIngestion

# Set page configuration
st.set_page_config(page_title="CSV Insight Bot", layout="wide")

# Initialize session state for conversation history
if "messages" not in st.session_state:
    st.session_state.messages = []

# App title and description
st.title("CSV Insight Bot")
st.write("Upload a CSV file and ask questions to get insights and visualizations!")

# Sidebar for API key
with st.sidebar:
    st.header("Settings")
    api_key = st.text_input("OpenAI API Key:", type="password")
    if api_key:
        os.environ["OPENAI_API_KEY"] = api_key
    
    st.header("Sample Questions")
    st.markdown("""
    - Summarize this dataset
    - Show me a bar chart of the top 5 categories
    - What are the correlations between columns?
    - What trends do you see in this data?
    - Generate a histogram for column X
    - What insights can you provide about this data?
    """)

# Function to analyze data with LLM
def analyze_with_llm(df, query, chat_history):
    """
    Analyze data using LLM and format the response
    
    Args:
        df: Pandas DataFrame with the data
        query: User's question
        chat_history: Conversation history
        
    Returns:
        Dictionary with response information
    """
    # Create a data summary for context
    buffer = StringIO()
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
    for message in chat_history:
        role = "Human" if message["role"] == "user" else "Assistant"
        content = message["content"]
        # Truncate very long messages
        if len(content) > 500:
            content = content[:500] + "... [content truncated]"
        conversation_history += f"{role}: {content}\n"
    
    # Create a prompt template with conversation history
    template = """
    You are a data analysis assistant that helps generate insights and visualization code based on CSV data.
    
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
    
    # Initialize the LLM
    llm = ChatOpenAI(
        temperature=0.2, 
        model="gpt-4-turbo",
        api_key=os.environ.get("OPENAI_API_KEY")
    )
    
    # Create and run the chain with memory
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
            
            # Add a response field for API consistency
            if "insight" in result and "response" not in result:
                result["response"] = result["insight"]
            
            return result
        else:
            # Check if response contains "DataFrame operation" or similar phrases
            # indicating this might be a direct operation result
            if "dataframe operation" in response.lower() or "operation" in response.lower():
                return {
                    "response": response,
                    "data": {"result": "Operation completed", "details": response}
                }
            
            # Fallback if JSON not properly formatted
            return {
                "response": response,
                "insight": response,
                "visualization_code": "",
                "visualization_type": None
            }
    except Exception as e:
        st.error(f"Error parsing response: {e}")
        st.write("Raw response:", response)
        return {
            "response": response,
            "insight": response,
            "visualization_code": "",
            "visualization_type": None
        }

# Function to execute visualization code safely
def create_visualization(code, df):
    try:
        # Create a new figure
        plt.figure(figsize=(10, 6))
        
        # Execute the code with the dataframe
        exec(code, {"df": df, "plt": plt, "sns": sns, "pd": pd})
        
        # Return the figure
        return plt.gcf()
    except Exception as e:
        st.error(f"Error in visualization: {e}")
        return None

# File upload
uploaded_file = st.file_uploader("Upload your CSV file", type="csv")

if uploaded_file is not None:
    # Load data
    df = pd.read_csv(uploaded_file)
    
    # Display data overview
    st.subheader("Data Overview")
    col1, col2 = st.columns(2)
    with col1:
        st.write(f"Rows: {df.shape[0]}")
        st.write(f"Columns: {df.shape[1]}")
    with col2:
        st.write("Column Types:")
        st.write(df.dtypes)
    
    # Add support for image table extraction
    if api_key:
        st.subheader("Image Table Extraction")
        st.write("Upload an image containing a table to extract its data.")
        image_file = st.file_uploader("Upload image with table", type=["jpg", "jpeg", "png"], key="image_uploader")
        
        if image_file:
            with st.spinner("Extracting table from image..."):
                try:
                    # Save uploaded image to a temporary file
                    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{image_file.type.split('/')[1]}") as tmp_file:
                        tmp_file.write(image_file.getvalue())
                        temp_path = tmp_file.name
                    
                    # Use DataIngestion for extraction
                    data_ingestion = DataIngestion(verbose=True, gemini_api_key=os.environ.get("GEMINI_API_KEY"))
                    extracted_df = data_ingestion.load_data(temp_path, file_type=image_file.type.split('/')[1])
                    
                    if not extracted_df.empty:
                        st.success(f"Successfully extracted table with {len(extracted_df)} rows and {len(extracted_df.columns)} columns!")
                        st.dataframe(extracted_df)
                        
                        # Option to use the extracted data
                        if st.button("Use This Extracted Data"):
                            df = extracted_df
                            st.session_state.messages = []  # Reset conversation
                            st.experimental_rerun()
                    else:
                        st.error("Failed to extract table from image. Try another image or format.")
                    
                    # Clean up temp file
                    try:
                        os.unlink(temp_path)
                    except:
                        pass
                    
                except Exception as e:
                    st.error(f"Error extracting table: {str(e)}")
    
    # Display sample data
    with st.expander("Preview Data"):
        st.dataframe(df.head())
    
    # Display chat history
    chat_container = st.container()
    with chat_container:
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.write(message["content"])
                if "visualization" in message and message["visualization"]:
                    st.pyplot(message["visualization"])
    
    # Chat input
    query = st.chat_input("Ask a question about your data:")
    
    # Process query
    if query:
        if not api_key:
            st.warning("Please enter your OpenAI API key in the sidebar.")
        else:
            # Add user message to chat history
            st.session_state.messages.append({"role": "user", "content": query})
            
            # Display user message
            with st.chat_message("user"):
                st.write(query)
            
            # Display assistant response with spinner
            with st.chat_message("assistant"):
                with st.spinner("Analyzing your data..."):
                    # Get analysis from LLM
                    result = analyze_with_llm(df, query, st.session_state.messages)
                    
                    # Check if the result is already a dictionary (direct API response format)
                    if isinstance(result, dict) and "response" in result:
                        # Handle pre-formatted API response
                        insight = result.get("response", "")
                        visualization_content = result.get("visualization") 
                        visualization_code = result.get("visualization_code")
                        visualization_type = result.get("visualization_type")
                        data = result.get("data")
                    else:
                        # Use the traditional parse logic for LLM responses
                        insight = result.get("insight", str(result))
                        visualization_code = result.get("visualization_code", "")
                        visualization_content = None
                        visualization_type = result.get("visualization_type")
                        data = None
                    
                    # Display insight
                    st.write(insight)
                    
                    # Store visualization in message
                    visualization = None
                    
                    # Display visualization if available
                    if visualization_content and "<div" in visualization_content and "plotly" in visualization_content.lower():
                        # Display plotly HTML directly
                        st.components.v1.html(visualization_content, height=500)
                        visualization = {"type": "plotly_html", "content": visualization_content}
                    elif visualization_code and visualization_code.strip():
                        # Create and display visualization
                        fig = create_visualization(visualization_code, df)
                        if fig:
                            st.pyplot(fig)
                            visualization = fig
                        
                        # Show the code
                        with st.expander("View Visualization Code"):
                            st.code(visualization_code, language="python")
                    
                    # Show data if available
                    if data and isinstance(data, dict):
                        with st.expander("View Data Details"):
                            st.json(data)
            
            # Add assistant response to chat history
            st.session_state.messages.append({
                "role": "assistant", 
                "content": insight if isinstance(insight, str) else str(insight),
                "visualization": visualization,
                "visualization_code": visualization_code if "visualization_code" in locals() and visualization_code else "",
                "data": data if "data" in locals() and data else None
            })
else:
    st.info("Please upload a CSV file to begin analysis.")

# Reset conversation button
if st.session_state.messages:
    if st.button("Reset Conversation"):
        st.session_state.messages = []
        st.experimental_rerun()

# Footer
st.markdown("---")
st.caption("CSV Insight Bot - Powered by LangChain and OpenAI with Conversation Memory")