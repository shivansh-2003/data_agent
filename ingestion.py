import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

import pandas as pd
import numpy as np
import io
import tempfile
from typing import Dict, List, Union, Optional, Any
import pytesseract
from PIL import Image
import cv2
import PyPDF2
import subprocess
import requests
import json
from pdf2image import convert_from_path, convert_from_bytes
import google.generativeai as genai

class DataIngestion:
    """
    A class to handle data ingestion from various file formats (CSV, Excel, PDF, image)
    with basic data cleaning functionality.
    """
    
    def __init__(self, verbose: bool = False, gemini_api_key: Optional[str] = None):
        """
        Initialize the DataIngestion class.
        
        Args:
            verbose (bool): Whether to print verbose output
            gemini_api_key (str, optional): API key for Google Gemini model for image table extraction
        """
        self.df = None
        self.verbose = verbose
        self.file_path = None
        self.file_type = None
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")  # Load from environment variable if not provided
    
    def load_data(self, 
                  source: Union[str, pd.DataFrame, bytes], 
                  file_type: Optional[str] = None,
                  sheet_name: Optional[str] = None,
                  encoding: str = 'utf-8') -> pd.DataFrame:
        """
        Load data from various file formats.
        
        Args:
            source: File path, DataFrame, or bytes
            file_type: File type (csv, excel, pdf, image)
            sheet_name: Sheet name for Excel files
            encoding: File encoding
            
        Returns:
            DataFrame containing the loaded data
        """
        if isinstance(source, pd.DataFrame):
            self.df = source
            self.file_type = "dataframe"
            if self.verbose:
                print("Data loaded from DataFrame")
            
        elif isinstance(source, str):
            # Check if it's a file path
            if os.path.exists(source):
                self.file_path = source
                
                # Determine file type if not provided
                if file_type is None:
                    _, extension = os.path.splitext(source)
                    file_type = extension[1:].lower()
                
                self.file_type = file_type
                
                # Load based on file type
                if file_type in ['csv', 'txt']:
                    self.df = pd.read_csv(source, encoding=encoding)
                    if self.verbose:
                        print(f"Data loaded from CSV file: {source}")
                        
                elif file_type in ['xlsx', 'xls', 'excel']:
                    if sheet_name:
                        self.df = pd.read_excel(source, sheet_name=sheet_name)
                    else:
                        self.df = pd.read_excel(source)
                    if self.verbose:
                        print(f"Data loaded from Excel file: {source}")
                        
                elif file_type in ['pdf']:
                    # Extract tables from PDF
                    self.df = self._extract_tables_from_pdf(source)
                    if self.verbose:
                        print(f"Data extracted from PDF: {source}")
                        
                elif file_type in ['jpg', 'jpeg', 'png', 'bmp', 'tiff']:
                    # Extract table from image
                    self.df = self._extract_table_from_image(source)
                    if self.verbose:
                        print(f"Data extracted from image: {source}")
                    
                else:
                    raise ValueError(f"Unsupported file type: {file_type}")
            else:
                # Assume it's a string containing data
                if file_type == 'csv':
                    self.df = pd.read_csv(io.StringIO(source), encoding=encoding)
                    if self.verbose:
                        print("Data loaded from CSV string")
                else:
                    raise ValueError("For string data, file_type must be specified as 'csv'")
                
        elif isinstance(source, bytes):
            # Load from bytes
            if file_type in ['csv', 'txt']:
                self.df = pd.read_csv(io.BytesIO(source), encoding=encoding)
                if self.verbose:
                    print("Data loaded from CSV bytes")
            elif file_type in ['xlsx', 'xls', 'excel']:
                if sheet_name:
                    self.df = pd.read_excel(io.BytesIO(source), sheet_name=sheet_name)
                else:
                    self.df = pd.read_excel(io.BytesIO(source))
                if self.verbose:
                    print("Data loaded from Excel bytes")
            elif file_type in ['pdf']:
                # Extract tables from PDF bytes
                self.df = self._extract_tables_from_pdf_bytes(source)
                if self.verbose:
                    print("Data extracted from PDF bytes")
            elif file_type in ['jpg', 'jpeg', 'png', 'bmp', 'tiff']:
                # Extract table from image bytes
                self.df = self._extract_table_from_image_bytes(source)
                if self.verbose:
                    print("Data extracted from image bytes")
            else:
                raise ValueError(f"Unsupported file type for bytes input: {file_type}")
        
        else:
            raise ValueError("Source must be a file path, DataFrame, or bytes")
        
        return self.df
    
    def _extract_table_from_image(self, image_path: str) -> pd.DataFrame:
        """
        Extract table from an image using OCR or Gemini API if available.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            DataFrame containing the extracted table
        """
        # Try using Gemini API if key is provided
        if self.gemini_api_key:
            try:
                # Load the image
                with open(image_path, "rb") as img_file:
                    img_data = img_file.read()
                image = Image.open(io.BytesIO(img_data))

                # Initialize Gemini Vision model
                model = genai.GenerativeModel("gemini-1.5-flash")

                # Generate a response from the model
                response = model.generate_content([image, "Extract the table data from this image in structured format."])

                # Get the extracted text
                extracted_text = response.text

                # Convert text to structured format
                lines = extracted_text.strip().split("\n")
                columns = lines[0].split()  # Extract column headers
                rows = [line.split() for line in lines[1:]]  # Extract rows

                # Check if the number of columns in rows matches the number of columns
                adjusted_rows = []
                for i, row in enumerate(rows):
                    if len(row) != len(columns):
                        print(f"Row {i} has {len(row)} columns, expected {len(columns)} columns. Adjusting...")
                        # Pad or truncate the row to match the number of columns
                        if len(row) < len(columns):
                            row += [""] * (len(columns) - len(row))  # Pad with empty strings
                        else:
                            row = row[:len(columns)]  # Truncate
                    adjusted_rows.append(row)

                # Create a DataFrame
                return pd.DataFrame(adjusted_rows, columns=columns)

            except Exception as e:
                if self.verbose:
                    print(f"Error extracting table using Gemini: {e}")
                print("Falling back to OCR...")

        # Fallback to OCR if Gemini API fails or is not available
        try:
            # Read the image
            img = cv2.imread(image_path)
            
            # Preprocess the image
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
            
            # Extract text using OCR
            text = pytesseract.image_to_string(binary)
            
            # Convert OCR text to DataFrame
            lines = text.strip().split('\n')
            if not lines:
                return pd.DataFrame()
                
            # Try to identify header
            header = lines[0].split()
            data = []
            
            for line in lines[1:]:
                values = line.split()
                if len(values) == len(header):
                    data.append(values)
            
            if header and data:
                return pd.DataFrame(data, columns=header)
            else:
                return pd.DataFrame({"text": lines})

        except Exception as e:
            if self.verbose:
                print(f"Error extracting table from image using OCR: {e}")
            return pd.DataFrame()
    
    def _extract_table_from_image_bytes(self, image_bytes: bytes) -> pd.DataFrame:
        """
        Extract table from image bytes using OCR or Gemini API if available.
        
        Args:
            image_bytes: Image as bytes
            
        Returns:
            DataFrame containing the extracted table
        """
        # Save bytes to temporary file
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name
        
        try:
            # Use the file-based method
            df = self._extract_table_from_image(temp_path)
            
            # Clean up
            os.unlink(temp_path)
            
            return df
        
        except Exception as e:
            # Clean up
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
            if self.verbose:
                print(f"Error extracting table from image bytes: {e}")
            return pd.DataFrame()
    
    def _extract_tables_from_pdf(self, pdf_path: str) -> pd.DataFrame:
        """
        Extract tables from PDF file using OCR.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            DataFrame containing the extracted tables
        """
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path)
            
            # Extract tables from each image
            all_dfs = []
            for i, img in enumerate(images):
                # Save image to temporary file
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                    img.save(temp_file.name)
                    temp_path = temp_file.name
                
                # Extract table from image
                df = self._extract_table_from_image(temp_path)
                
                # Add page number
                if not df.empty:
                    df['page'] = i + 1
                    all_dfs.append(df)
                
                # Clean up
                os.unlink(temp_path)
            
            # Combine all DataFrames
            if all_dfs:
                return pd.concat(all_dfs, ignore_index=True)
            else:
                return pd.DataFrame()
                
        except Exception as e:
            if self.verbose:
                print(f"Error extracting tables from PDF: {e}")
            return pd.DataFrame()
    
    def _extract_tables_from_pdf_bytes(self, pdf_bytes: bytes) -> pd.DataFrame:
        """
        Extract tables from PDF bytes using OCR.
        
        Args:
            pdf_bytes: PDF as bytes
            
        Returns:
            DataFrame containing the extracted tables
        """
        try:
            # Convert PDF bytes to images
            images = convert_from_bytes(pdf_bytes)
            
            # Extract tables from each image
            all_dfs = []
            for i, img in enumerate(images):
                # Save image to temporary file
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                    img.save(temp_file.name)
                    temp_path = temp_file.name
                
                # Extract table from image
                df = self._extract_table_from_image(temp_path)
                
                # Add page number
                if not df.empty:
                    df['page'] = i + 1
                    all_dfs.append(df)
                
                # Clean up
                os.unlink(temp_path)
            
            # Combine all DataFrames
            if all_dfs:
                return pd.concat(all_dfs, ignore_index=True)
            else:
                return pd.DataFrame()
                
        except Exception as e:
            if self.verbose:
                print(f"Error extracting tables from PDF bytes: {e}")
            return pd.DataFrame()
    
    def _extract_table_using_gemini(self, image_path: str) -> pd.DataFrame:
        """
        Extract table from image using Google Gemini model.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            DataFrame containing the extracted table
        """
        if not self.gemini_api_key:
            raise ValueError("Gemini API key not provided")
        
        # Read the image and encode as base64
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()
            
        # Create request to Gemini API
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.gemini_api_key
        }
        
        # Encode image as base64
        import base64
        image_b64 = base64.b64encode(image_data).decode("utf-8")
        
        # Create payload
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": "Extract the table from this image and format it as a CSV string. Include column headers if present. Only return the CSV data without any explanations or additional text."
                        },
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": image_b64
                            }
                        }
                    ]
                }
            ]
        }
        
        # Make request
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            response_json = response.json()
            csv_text = response_json["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean up any markdown formatting
            if "```" in csv_text:
                csv_text = csv_text.split("```")[1]
                if csv_text.startswith("csv\n"):
                    csv_text = csv_text[4:]
            
            # Parse CSV text
            return pd.read_csv(io.StringIO(csv_text))
        else:
            raise Exception(f"API request failed with status code {response.status_code}: {response.text}")
    
    def clean_data(self, 
                   handle_missing: bool = True, 
                   handle_duplicates: bool = True,
                   missing_strategy: str = 'auto') -> pd.DataFrame:
        """
        Clean the loaded data by handling missing values and duplicates.
        
        Args:
            handle_missing: Whether to handle missing values
            handle_duplicates: Whether to handle duplicate rows
            missing_strategy: Strategy for handling missing values:
                - 'auto': Automatically determine based on data
                - 'drop': Drop rows with missing values
                - 'mean': Fill numeric missing values with mean
                - 'median': Fill numeric missing values with median
                - 'mode': Fill categorical missing values with mode
                - 'zero': Fill numeric missing values with zero
                
        Returns:
            Cleaned DataFrame
        """
        if self.df is None:
            raise ValueError("No data loaded. Load data before cleaning.")
        
        # Make a copy to avoid modifying the original
        cleaned_df = self.df.copy()
        
        # Handle duplicates
        if handle_duplicates:
            original_count = len(cleaned_df)
            cleaned_df = cleaned_df.drop_duplicates()
            if self.verbose and original_count > len(cleaned_df):
                print(f"Removed {original_count - len(cleaned_df)} duplicate rows")
        
        # Handle missing values
        if handle_missing:
            # Get numeric and categorical columns
            numeric_cols = cleaned_df.select_dtypes(include=['number']).columns.tolist()
            categorical_cols = cleaned_df.select_dtypes(include=['object', 'category']).columns.tolist()
            
            # Determine strategy for each column type
            if missing_strategy == 'auto':
                # For numeric columns
                for col in numeric_cols:
                    missing_count = cleaned_df[col].isna().sum()
                    if missing_count > 0:
                        missing_pct = missing_count / len(cleaned_df)
                        if missing_pct > 0.3:  # If more than 30% missing, consider dropping column
                            if missing_pct > 0.5:  # If more than 50% missing, drop column
                                cleaned_df = cleaned_df.drop(columns=[col])
                                if self.verbose:
                                    print(f"Dropped column {col} with {missing_pct*100:.1f}% missing values")
                            else:
                                # For 30-50% missing, use median
                                cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].median())
                                if self.verbose:
                                    print(f"Filled missing values in {col} with median")
                        else:
                            # For less than 30% missing, use mean
                            cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].mean())
                            if self.verbose:
                                print(f"Filled missing values in {col} with mean")
                
                # For categorical columns
                for col in categorical_cols:
                    missing_count = cleaned_df[col].isna().sum()
                    if missing_count > 0:
                        missing_pct = missing_count / len(cleaned_df)
                        if missing_pct > 0.5:  # If more than 50% missing, drop column
                            cleaned_df = cleaned_df.drop(columns=[col])
                            if self.verbose:
                                print(f"Dropped column {col} with {missing_pct*100:.1f}% missing values")
                        else:
                            # Use mode for categorical columns
                            mode_val = cleaned_df[col].mode()[0]
                            cleaned_df[col] = cleaned_df[col].fillna(mode_val)
                            if self.verbose:
                                print(f"Filled missing values in {col} with mode: {mode_val}")
            
            elif missing_strategy == 'drop':
                original_count = len(cleaned_df)
                cleaned_df = cleaned_df.dropna()
                if self.verbose:
                    print(f"Dropped {original_count - len(cleaned_df)} rows with missing values")
            
            elif missing_strategy == 'mean':
                # Fill numeric columns with mean
                for col in numeric_cols:
                    if cleaned_df[col].isna().sum() > 0:
                        cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].mean())
                        if self.verbose:
                            print(f"Filled missing values in {col} with mean")
                
                # Fill categorical columns with mode
                for col in categorical_cols:
                    if cleaned_df[col].isna().sum() > 0:
                        mode_val = cleaned_df[col].mode()[0]
                        cleaned_df[col] = cleaned_df[col].fillna(mode_val)
                        if self.verbose:
                            print(f"Filled missing values in {col} with mode: {mode_val}")
            
            elif missing_strategy == 'median':
                # Fill numeric columns with median
                for col in numeric_cols:
                    if cleaned_df[col].isna().sum() > 0:
                        cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].median())
                        if self.verbose:
                            print(f"Filled missing values in {col} with median")
                
                # Fill categorical columns with mode
                for col in categorical_cols:
                    if cleaned_df[col].isna().sum() > 0:
                        mode_val = cleaned_df[col].mode()[0]
                        cleaned_df[col] = cleaned_df[col].fillna(mode_val)
                        if self.verbose:
                            print(f"Filled missing values in {col} with mode: {mode_val}")
            
            elif missing_strategy == 'mode':
                # Fill all columns with mode
                for col in cleaned_df.columns:
                    if cleaned_df[col].isna().sum() > 0:
                        mode_val = cleaned_df[col].mode()[0]
                        cleaned_df[col] = cleaned_df[col].fillna(mode_val)
                        if self.verbose:
                            print(f"Filled missing values in {col} with mode: {mode_val}")
            
            elif missing_strategy == 'zero':
                # Fill numeric columns with 0
                for col in numeric_cols:
                    if cleaned_df[col].isna().sum() > 0:
                        cleaned_df[col] = cleaned_df[col].fillna(0)
                        if self.verbose:
                            print(f"Filled missing values in {col} with 0")
                
                # Fill categorical columns with 'Unknown'
                for col in categorical_cols:
                    if cleaned_df[col].isna().sum() > 0:
                        cleaned_df[col] = cleaned_df[col].fillna('Unknown')
                        if self.verbose:
                            print(f"Filled missing values in {col} with 'Unknown'")
            
            else:
                raise ValueError(f"Unsupported missing value strategy: {missing_strategy}")
        
        return cleaned_df

# Example usage
if __name__ == "__main__":
    # Create DataIngestion object
    data_ingestion = DataIngestion(verbose=True)
    
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
    df = data_ingestion.load_data(example_data, file_type='csv')
    print(df.head())
    
    # Clean data
    cleaned_df = data_ingestion.clean_data(handle_missing=True, handle_duplicates=True)
    print("\nCleaned Data:")
    print(cleaned_df.head())