import pandas as pd
from typing import Optional, Any
from abc import ABC, abstractmethod
import streamlit as st

class BaseDataAnalystAgent(ABC):
    """Abstract base class for Data Analyst Agents"""
    
    @abstractmethod
    def load_data_from_file(self, file_path: str) -> str:
        """Load data from a file"""
        pass
    
    @abstractmethod
    def load_data_from_string(self, data_str: str, file_format: str = "csv") -> str:
        """Load data from a string"""
        pass
    
    @abstractmethod
    def query(self, user_input: str) -> str:
        """Process a user query"""
        pass

    def _apply_custom_css(self):
        """Apply custom CSS styling"""
        st.markdown("""
        <style>
            .chat-message {
                display: flex;
                align-items: flex-start;
                margin-bottom: 1rem;
                padding: 0.75rem;
                border-radius: 0.5rem;
            }
            .chat-message .chat-icon {
                margin-right: 0.75rem;
                font-size: 1.25rem;
            }
            .chat-message .chat-content {
                flex-grow: 1;
                line-height: 1.4;
            }
            .chat-message.user {
                background-color: #f0f2f6;
            }
            .chat-message.assistant {
                background-color: #e6f7ff;
            }
        </style>
        """, unsafe_allow_html=True) 