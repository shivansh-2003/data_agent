from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Union
import pandas as pd
import os
import io
import tempfile
import json
import asyncio
import uuid
from pathlib import Path
import logging
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import app components
from data_analyst_agent import create_data_analyst_agent
from ingestion import DataIngestion

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Data Analyst AI Assistant API",
    description="API for analyzing data with AI assistants",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session store for agent instances and active sessions
active_sessions = {}
temp_files = {}

# Pydantic models for requests and responses
class AgentInitRequest(BaseModel):
    model_name: str = "gpt-4"

class ChatRequest(BaseModel):
    session_id: str
    query: str

class ChatResponse(BaseModel):
    response: str
    visualization: Optional[str] = None
    visualization_code: Optional[str] = None
    visualization_type: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class DataSummaryResponse(BaseModel):
    summary: str
    shape: Dict[str, int]
    columns: List[Dict[str, Any]]
    sample_data: List[Dict[str, Any]]

# Helper functions
def get_session_agent(session_id: str):
    """Get the agent instance for the given session ID"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    return active_sessions[session_id]["agent"]

def cleanup_session(session_id: str):
    """Clean up temporary files when a session is deleted"""
    if session_id in temp_files:
        for file_path in temp_files[session_id]:
            try:
                if os.path.exists(file_path):
                    os.unlink(file_path)
                    logger.info(f"Cleaned up temporary file: {file_path}")
            except Exception as e:
                logger.error(f"Error cleaning up file {file_path}: {e}")
        del temp_files[session_id]
    
    if session_id in active_sessions:
        del active_sessions[session_id]
        logger.info(f"Session {session_id} deleted")

# Session management endpoints
@app.post("/sessions", summary="Create a new session")
async def create_session(request: AgentInitRequest):
    """
    Create a new session with an initialized agent
    """
    try:
        session_id = str(uuid.uuid4())
        
        # Get API keys from environment
        openai_api_key = os.getenv("OPENAI_API_KEY")
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if not openai_api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not found in environment variables")
        
        # Initialize LangChain agent
        agent = create_data_analyst_agent(
            openai_api_key=openai_api_key,
            model_name=request.model_name
        )
        
        # Update DataIngestion in agent with Gemini API key if present
        if hasattr(agent, 'data_ingestion') and gemini_api_key:
            agent.data_ingestion.gemini_api_key = gemini_api_key
        
        # Store session data
        active_sessions[session_id] = {
            "agent": agent,
            "created_at": time.time(),
            "last_activity": time.time(),
            "model_name": request.model_name,
            "agent_type": "LangChain Agent"
        }
        
        temp_files[session_id] = []
        
        return {"session_id": session_id, "message": "Agent initialized successfully"}
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")

@app.delete("/sessions/{session_id}", summary="Delete a session")
async def delete_session(session_id: str, background_tasks: BackgroundTasks):
    """
    Delete a session and clean up resources
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    background_tasks.add_task(cleanup_session, session_id)
    return {"message": f"Session {session_id} scheduled for deletion"}

# Data management endpoints
@app.post("/sessions/{session_id}/data/upload", summary="Upload and process data")
async def upload_data(
    session_id: str,
    file: UploadFile = File(...),
):
    """
    Upload a data file and process it
    """
    agent = get_session_agent(session_id)
    
    # Create temporary file
    suffix = Path(file.filename).suffix.lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        try:
            # Write uploaded data to temp file
            content = await file.read()
            tmp_file.write(content)
            temp_path = tmp_file.name
            
            # Track temp file for cleanup
            if session_id not in temp_files:
                temp_files[session_id] = []
            temp_files[session_id].append(temp_path)
            
            # Get Gemini API key for image processing if available
            gemini_api_key = os.getenv("GEMINI_API_KEY")
            
            # Check if it's an image file that needs special processing
            if suffix in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
                # Initialize DataIngestion with Gemini API key for image processing
                data_ingestion = DataIngestion(verbose=True, gemini_api_key=gemini_api_key)
                
                # Load data from image
                df = data_ingestion.load_data(temp_path, file_type=suffix[1:])
                
                # Set the DataFrame in the agent
                agent.dataframe_tool.dataframe = df
                
                # Generate DataFrame description
                if hasattr(agent, '_generate_df_description'):
                    agent.dataframe_tool.dataframe_description = agent._generate_df_description(df)
                
                result = f"Image table data extracted successfully with {len(df)} rows and {len(df.columns)} columns."
                if hasattr(agent.dataframe_tool, 'dataframe_description'):
                    result += f"\n{agent.dataframe_tool.dataframe_description}"
            else:
                # Process regular file with agent
                result = agent.load_data_from_file(temp_path)
            
            # Update session activity
            active_sessions[session_id]["last_activity"] = time.time()
            
            # Check for error in result
            if isinstance(result, str) and "error" in result.lower():
                raise HTTPException(status_code=400, detail=result)
            
            return {"message": "Data processed successfully", "summary": result}
            
        except Exception as e:
            logger.error(f"Error processing uploaded file: {e}")
            # Clean up temp file if error
            try:
                os.unlink(temp_path)
                if session_id in temp_files and temp_path in temp_files[session_id]:
                    temp_files[session_id].remove(temp_path)
            except Exception as cleanup_error:
                logger.error(f"Error cleaning up temporary file: {cleanup_error}")
                pass
            raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/sessions/{session_id}/data/text", summary="Process data from text")
async def process_text_data(
    session_id: str,
    data: str = Form(...),
    format: str = Form("csv")
):
    """
    Process data from raw text input
    """
    agent = get_session_agent(session_id)
    
    try:
        result = agent.load_data_from_string(data, file_format=format)
        
        # Update session activity
        active_sessions[session_id]["last_activity"] = time.time()
        
        if isinstance(result, str) and "error" in result.lower():
            raise HTTPException(status_code=400, detail=result)
        
        return {"message": "Data processed successfully", "summary": result}
    except Exception as e:
        logger.error(f"Error processing text data: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing data: {str(e)}")

@app.get("/sessions/{session_id}/data/preview", summary="Get a preview of the loaded data")
async def get_data_preview(session_id: str, rows: int = 10):
    """
    Get a preview of the data loaded in the current session
    """
    agent = get_session_agent(session_id)
    
    if not hasattr(agent, 'dataframe_tool') or agent.dataframe_tool.dataframe is None:
        raise HTTPException(status_code=400, detail="No data loaded in this session")
    
    df = agent.dataframe_tool.dataframe
    
    try:
        # Get column information
        columns = []
        for col in df.columns:
            column_info = {
                "name": col,
                "dtype": str(df[col].dtype),
                "missing": int(df[col].isna().sum()),
                "missing_pct": float((df[col].isna().sum() / len(df)) * 100),
                "unique": int(df[col].nunique())
            }
            columns.append(column_info)
        
        # Get sample data
        sample_data = df.head(rows).to_dict(orient="records")
        
        # Create summary
        summary = f"DataFrame with {df.shape[0]} rows and {df.shape[1]} columns"
        
        response = {
            "summary": summary,
            "shape": {"rows": df.shape[0], "columns": df.shape[1]},
            "columns": columns,
            "sample_data": sample_data
        }
        
        return response
    except Exception as e:
        logger.error(f"Error getting data preview: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting data preview: {str(e)}")

# Query and chat endpoints
@app.post("/sessions/{session_id}/chat", summary="Chat with the agent", response_model=ChatResponse)
async def chat(session_id: str, request: ChatRequest):
    """
    Send a query to the agent and get a response
    """
    # Validate session match
    if request.session_id != session_id:
        raise HTTPException(status_code=400, detail="Session ID mismatch")
    
    agent = get_session_agent(session_id)
    
    try:
        # Process the query
        response = agent.query(request.query)
        
        # Update session activity
        active_sessions[session_id]["last_activity"] = time.time()
        
        # Extract visualization if present
        visualization = None
        visualization_code = None
        visualization_type = None
        data = None
        
        # Check if the response is a dictionary with visualization information
        if isinstance(response, dict):
            # Extract standard fields if they exist
            visualization = response.get('visualization')
            visualization_code = response.get('visualization_code')
            visualization_type = response.get('visualization_type', 'plotly')
            data = response.get('data')
            
            # Get the response text
            if 'response' in response:
                response_text = response.get('response')
            elif 'insight' in response:
                response_text = response.get('insight', '')
            elif 'message' in response:
                response_text = response.get('message', '')
            else:
                # If no text field is found, convert the whole dict to a formatted string
                response_text = json.dumps(response, indent=2)
            
            return {
                "response": response_text,
                "visualization": visualization,
                "visualization_code": visualization_code,
                "visualization_type": visualization_type,
                "data": data
            }
        
        # Parse visualization from HTML response if present
        elif isinstance(response, str):
            # Check if the response is a JSON string
            if response.strip().startswith('{') and response.strip().endswith('}'):
                try:
                    # Try to parse as JSON
                    parsed_json = json.loads(response)
                    if isinstance(parsed_json, dict):
                        # Format nicely for display
                        response_text = json.dumps(parsed_json, indent=2)
                        return {
                            "response": response_text,
                            "visualization": None,
                            "visualization_code": None,
                            "visualization_type": None,
                            "data": parsed_json
                        }
                except json.JSONDecodeError:
                    # Not valid JSON, continue with normal processing
                    pass
            
            # Extract plotly visualization if present
            if "<div id=" in response and "plotly" in response.lower():
                visualization = response
                visualization_type = "plotly"
                
                # Try to extract just the visualization part if it's mixed with text
                try:
                    viz_start = response.find("<div")
                    if viz_start > 0:
                        text_part = response[:viz_start].strip()
                        visualization_part = response[viz_start:]
                        return {
                            "response": text_part,
                            "visualization": visualization_part,
                            "visualization_code": None,
                            "visualization_type": "plotly",
                            "data": None
                        }
                except:
                    # If extraction fails, return the whole response as is
                    pass
        
        return {
            "response": response,
            "visualization": visualization,
            "visualization_code": visualization_code,
            "visualization_type": visualization_type,
            "data": data
        }
    except Exception as e:
        logger.error(f"Error processing chat query: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

# Analysis endpoints
@app.post("/sessions/{session_id}/analyze/basic", summary="Get basic statistical analysis")
async def basic_analysis(session_id: str):
    """
    Get basic statistical analysis of the loaded data
    """
    agent = get_session_agent(session_id)
    
    if not hasattr(agent, 'dataframe_tool') or agent.dataframe_tool.dataframe is None:
        raise HTTPException(status_code=400, detail="No data loaded in this session")
    
    try:
        # Use the analysis tool directly via a query
        response = agent.query("Provide a basic statistical analysis of the data")
        
        # Update session activity
        active_sessions[session_id]["last_activity"] = time.time()
        
        return {"analysis": response}
    except Exception as e:
        logger.error(f"Error generating basic analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating analysis: {str(e)}")

@app.post("/sessions/{session_id}/analyze/correlation", summary="Get correlation analysis")
async def correlation_analysis(session_id: str, columns: Optional[List[str]] = None):
    """
    Get correlation analysis for selected columns
    """
    agent = get_session_agent(session_id)
    
    if not hasattr(agent, 'dataframe_tool') or agent.dataframe_tool.dataframe is None:
        raise HTTPException(status_code=400, detail="No data loaded in this session")
    
    try:
        # Create the query based on columns
        if columns:
            query = f"Generate a correlation analysis for these columns: {', '.join(columns)}"
        else:
            query = "Generate a correlation analysis for all numeric columns"
        
        response = agent.query(query)
        
        # Update session activity
        active_sessions[session_id]["last_activity"] = time.time()
        
        return {"analysis": response}
    except Exception as e:
        logger.error(f"Error generating correlation analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating analysis: {str(e)}")

@app.post("/sessions/{session_id}/analyze/timeseries", summary="Get time series analysis")
async def timeseries_analysis(
    session_id: str, 
    time_column: str,
    value_column: str,
    frequency: Optional[str] = "month"
):
    """
    Get time series analysis for the specified columns
    """
    agent = get_session_agent(session_id)
    
    if not hasattr(agent, 'dataframe_tool') or agent.dataframe_tool.dataframe is None:
        raise HTTPException(status_code=400, detail="No data loaded in this session")
    
    try:
        query = f"Create a time series analysis of {value_column} over {time_column} with {frequency} frequency"
        response = agent.query(query)
        
        # Update session activity
        active_sessions[session_id]["last_activity"] = time.time()
        
        return {"analysis": response}
    except Exception as e:
        logger.error(f"Error generating time series analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating analysis: {str(e)}")

@app.post("/sessions/{session_id}/visualize", summary="Generate visualization")
async def generate_visualization(
    session_id: str,
    viz_type: str,
    x_column: Optional[str] = None,
    y_column: Optional[str] = None,
    group_by: Optional[str] = None,
    title: Optional[str] = None
):
    """
    Generate a visualization of the specified type
    """
    agent = get_session_agent(session_id)
    
    if not hasattr(agent, 'dataframe_tool') or agent.dataframe_tool.dataframe is None:
        raise HTTPException(status_code=400, detail="No data loaded in this session")
    
    try:
        # Construct visualization query
        query_parts = [f"Create a {viz_type} visualization"]
        
        if x_column:
            query_parts.append(f"with {x_column} on the x-axis")
        
        if y_column:
            query_parts.append(f"and {y_column} on the y-axis")
        
        if group_by:
            query_parts.append(f"grouped by {group_by}")
        
        if title:
            query_parts.append(f"with the title '{title}'")
        
        query = " ".join(query_parts)
        
        # Execute the query
        response = agent.query(query)
        
        # Update session activity
        active_sessions[session_id]["last_activity"] = time.time()
        
        # Check if the response contains a visualization
        if "<div id=" in response and "plotly" in response.lower():
            visualization = response
        else:
            visualization = None
        
        return {
            "response": response,
            "visualization": visualization
        }
    except Exception as e:
        logger.error(f"Error generating visualization: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating visualization: {str(e)}")

# Session status endpoint
@app.get("/sessions/{session_id}/status", summary="Check session status")
async def session_status(session_id: str):
    """
    Check the status of a session
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    session = active_sessions[session_id]
    
    # Calculate session duration
    duration = time.time() - session["created_at"]
    last_activity = time.time() - session["last_activity"]
    
    return {
        "session_id": session_id,
        "active": True,
        "created_at": session["created_at"],
        "last_activity": session["last_activity"],
        "duration_seconds": duration,
        "idle_seconds": last_activity,
        "model_name": session["model_name"],
        "agent_type": session["agent_type"],
        "data_loaded": hasattr(session["agent"], 'dataframe_tool') and session["agent"].dataframe_tool.dataframe is not None
    }

# Health check endpoint
@app.get("/health", summary="Health check")
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "ok",
        "active_sessions": len(active_sessions),
        "version": app.version
    }

# Background task to clean up old sessions
@app.on_event("startup")
async def setup_periodic_cleanup():
    async def cleanup_old_sessions():
        while True:
            try:
                current_time = time.time()
                session_timeout = 3600  # 1 hour
                
                # Check for sessions to clean up
                sessions_to_remove = []
                for session_id, session in active_sessions.items():
                    if current_time - session["last_activity"] > session_timeout:
                        sessions_to_remove.append(session_id)
                
                # Clean up old sessions
                for session_id in sessions_to_remove:
                    logger.info(f"Cleaning up inactive session {session_id}")
                    cleanup_session(session_id)
                
                # Sleep for 10 minutes
                await asyncio.sleep(600)
            except Exception as e:
                logger.error(f"Error in cleanup task: {e}")
                await asyncio.sleep(600)
    
    # Start the background task
    asyncio.create_task(cleanup_old_sessions())

# Add this after the data management endpoints

@app.post("/data/extract-table-from-image", summary="Extract table from image")
async def extract_table_from_image(
    file: UploadFile = File(...)
):
    """
    Extract a table from an image file directly without requiring a session
    """
    suffix = Path(file.filename).suffix.lower()
    
    # Validate file type
    if suffix not in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload an image file.")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        try:
            # Write uploaded data to temp file
            content = await file.read()
            tmp_file.write(content)
            temp_path = tmp_file.name
            
            # Get Gemini API key for image processing
            gemini_api_key = os.getenv("GEMINI_API_KEY")
            
            # Initialize DataIngestion with Gemini API key
            data_ingestion = DataIngestion(verbose=True, gemini_api_key=gemini_api_key)
            
            # Extract table from image
            df = data_ingestion.load_data(temp_path, file_type=suffix[1:])
            
            if df.empty:
                return {
                    "success": False,
                    "message": "No table data could be extracted from the image.",
                    "data": None
                }
            
            # Return extracted data
            return {
                "success": True,
                "message": f"Table extracted successfully with {len(df)} rows and {len(df.columns)} columns.",
                "data": {
                    "columns": df.columns.tolist(),
                    "shape": {"rows": df.shape[0], "columns": df.shape[1]},
                    "sample_data": df.head(10).to_dict(orient="records"),
                    "full_data": df.to_dict(orient="records")
                }
            }
            
        except Exception as e:
            logger.error(f"Error extracting table from image: {e}")
            # Clean up temp file
            try:
                os.unlink(temp_path)
            except:
                pass
            raise HTTPException(status_code=500, detail=f"Error extracting table: {str(e)}")
        finally:
            # Clean up temp file
            try:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
            except Exception as cleanup_error:
                logger.error(f"Error cleaning up temporary file: {cleanup_error}")
                pass

# Run the app with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)