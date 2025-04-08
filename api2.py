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

# Import enhanced agent
from langchain_module import create_enhanced_data_analyst_agent
from ingestion import DataIngestion

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Enhanced Data Analyst AI Assistant API",
    description="API for analyzing data with enhanced AI assistants that provide textual and visual insights",
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
class ChatRequest(BaseModel):
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
def create_new_agent_session(model_name="gpt-4"):
    """Helper function to create a new agent session"""
    try:
        session_id = str(uuid.uuid4())
        
        # Get API keys from environment
        openai_api_key = os.getenv("OPENAI_API_KEY")
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if not openai_api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not found in environment variables")
        
        # Basic validation of API key format
        if not openai_api_key.startswith(('sk-', 'org-')):
            logger.warning(f"OpenAI API key has an unusual format: {openai_api_key[:5]}...")
        
        logger.info(f"Creating agent with model: {model_name}")
        
        # Initialize Enhanced LangChain agent
        agent = create_enhanced_data_analyst_agent(
            openai_api_key=openai_api_key.strip(),  # Ensure no whitespace
            model_name=model_name,
            gemini_api_key=gemini_api_key.strip() if gemini_api_key else None
        )
        
        # Store session data
        active_sessions[session_id] = {
            "agent": agent,
            "created_at": time.time(),
            "last_activity": time.time(),
            "model_name": model_name,
            "agent_type": "Enhanced LangChain Agent",
            "openai_api_key": openai_api_key  # Store the API key with the session
        }
        
        temp_files[session_id] = []
        
        return session_id, agent
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")

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

def get_session_agent(session_id: str):
    """Get the agent instance for the given session ID"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    return active_sessions[session_id]["agent"]

# Endpoints for the enhanced agent
@app.post("/upload", summary="Upload and process data with enhanced analytics agent")
async def upload_data(
    file: UploadFile = File(...),
    model_name: str = Form("gpt-4")
):
    """
    Upload a data file and automatically create a session with enhanced data analyst agent.
    """
    # Create a new session with the specified model
    try:
        session_id, agent = create_new_agent_session(model_name)
        
        # Create temporary file
        suffix = Path(file.filename).suffix.lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            try:
                # Write uploaded data to temp file
                content = await file.read()
                tmp_file.write(content)
                temp_path = tmp_file.name
                
                # Track temp file for cleanup
                temp_files[session_id].append(temp_path)
                
                # Process the file
                result = agent.load_data_from_file(temp_path)
                
                # Update session activity
                active_sessions[session_id]["last_activity"] = time.time()
                
                # Check for error in result
                if isinstance(result, str) and "error" in result.lower():
                    # Clean up session on error
                    cleanup_session(session_id)
                    raise HTTPException(status_code=400, detail=result)
                
                # Get a preview of the data for the response
                df = agent.dataframe_tool.dataframe
                preview = {
                    "shape": {"rows": df.shape[0], "columns": df.shape[1]},
                    "columns": df.columns.tolist(),
                    "sample_data": df.head(5).to_dict(orient="records")
                }
                
                return {
                    "message": "Data processed successfully with enhanced analytics agent", 
                    "session_id": session_id,
                    "model_name": model_name,
                    "summary": result,
                    "preview": preview
                }
                
            except Exception as e:
                logger.error(f"Error processing uploaded file: {e}")
                # Clean up temp file and session if error
                try:
                    os.unlink(temp_path)
                    cleanup_session(session_id)
                except Exception as cleanup_error:
                    logger.error(f"Error cleaning up: {cleanup_error}")
                raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    except Exception as e:
        logger.error(f"Error in session creation: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")

@app.post("/sessions/{session_id}/query", response_model=ChatResponse, summary="Query the enhanced agent")
async def query_agent(session_id: str, request: ChatRequest):
    """
    Send a query to the enhanced agent and get a comprehensive response with both textual and visual insights
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    session = active_sessions[session_id]
    agent = session["agent"]
    
    try:
        # Check if API keys need refreshing
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key and openai_api_key != session.get("openai_api_key"):
            logger.info(f"Refreshing API key for session {session_id}")
            agent.llm.api_key = openai_api_key.strip()
            session["openai_api_key"] = openai_api_key
        
        # Process the query with additional error handling
        try:
            response = agent.query(request.query)
        except Exception as query_error:
            error_str = str(query_error)
            if "invalid_api_key" in error_str or "401" in error_str:
                # Log the API key issue (first few chars only for security)
                api_key_preview = session.get("openai_api_key", "")[:5] + "..." if session.get("openai_api_key") else "None"
                logger.error(f"API key error for session {session_id}. Key starts with: {api_key_preview}")
                raise HTTPException(status_code=401, detail="API key error. Please check your OpenAI API key.")
            else:
                # Re-raise original error
                raise
        
        # Update session activity
        session["last_activity"] = time.time()
        
        # Handle different response formats
        if isinstance(response, dict):
            # Return full response
            return response
        else:
            # Convert string response to standard format
            return {
                "response": response,
                "visualization": None,
                "visualization_code": None,
                "visualization_type": None,
                "data": None
            }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.get("/sessions/{session_id}", summary="Get session information")
async def get_session_info(session_id: str):
    """
    Get information about the current session
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    session = active_sessions[session_id]
    
    # Calculate duration
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
        "data_loaded": session["agent"].state["dataframe_loaded"]
    }

@app.delete("/sessions/{session_id}", summary="Delete a session")
async def delete_session(session_id: str, background_tasks: BackgroundTasks):
    """
    Delete a session and clean up resources
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    background_tasks.add_task(cleanup_session, session_id)
    return {"message": f"Session {session_id} scheduled for deletion"}

@app.get("/sessions", summary="List all active sessions")
async def list_sessions():
    """
    List all active sessions
    """
    sessions = []
    for session_id, session in active_sessions.items():
        sessions.append({
            "session_id": session_id,
            "model_name": session["model_name"],
            "agent_type": session["agent_type"],
            "created_at": session["created_at"],
            "last_activity": session["last_activity"],
            "data_loaded": session["agent"].state["dataframe_loaded"]
        })
    
    return {"sessions": sessions, "count": len(sessions)}

# Health check endpoint
@app.get("/health", summary="Health check")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "ok",
        "active_sessions": len(active_sessions),
        "version": app.version,
        "enhanced_agent": True
    }

# Direct query example endpoint - without session management
@app.post("/analyze/company_stats", summary="Analyze company statistics in uploaded data")
async def analyze_company_stats(file: UploadFile = File(...)):
    """
    Quick analysis of company statistics in the uploaded dataset
    """
    try:
        # Create temporary file
        suffix = Path(file.filename).suffix.lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            try:
                # Write uploaded data to temp file
                content = await file.read()
                tmp_file.write(content)
                temp_path = tmp_file.name
                
                # Get API keys from environment
                openai_api_key = os.getenv("OPENAI_API_KEY")
                
                if not openai_api_key:
                    raise HTTPException(status_code=500, detail="OpenAI API key not found in environment variables")
                
                # Create temporary agent
                agent = create_enhanced_data_analyst_agent(openai_api_key=openai_api_key)
                
                # Load the data
                result = agent.load_data_from_file(temp_path)
                
                # Check for error in result
                if isinstance(result, str) and "error" in result.lower():
                    raise HTTPException(status_code=400, detail=result)
                
                # Query for top companies
                response = agent.query("Which company has the most products in the dataset?")
                
                # Clean up temporary file
                try:
                    os.unlink(temp_path)
                except Exception as e:
                    logger.error(f"Error cleaning up temporary file: {e}")
                
                return response
            
            except Exception as e:
                logger.error(f"Error analyzing company stats: {e}")
                # Clean up temp file
                try:
                    os.unlink(temp_path)
                except:
                    pass
                raise HTTPException(status_code=500, detail=f"Error analyzing file: {str(e)}")
    except Exception as e:
        logger.error(f"Error handling file upload: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing upload: {str(e)}")

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

# Run the app with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Using port 8001 to avoid conflict with api.py 