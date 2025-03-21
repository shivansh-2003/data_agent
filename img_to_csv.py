import os
import pandas as pd
import google.generativeai as genai
from PIL import Image
import csv
from dotenv import load_dotenv
import argparse
from ingestion import DataIngestion

def extract_table_from_image(image_path, use_gemini=True, verbose=True):
    """
    Extract tabular data from an image using the improved DataIngestion class
    
    Args:
        image_path: Path to the image containing the table
        use_gemini: Whether to use Google's Gemini model (if API key is available)
        verbose: Whether to print verbose output
    
    Returns:
        A pandas DataFrame containing the extracted table data
    """
    # Load environment variables
    load_dotenv()
    
    # Get Gemini API key if requested
    gemini_api_key = os.environ.get('GEMINI_API_KEY') if use_gemini else None
    
    # Initialize DataIngestion with or without Gemini
    ingestion = DataIngestion(verbose=verbose, gemini_api_key=gemini_api_key)
    
    # Extract table from image
    try:
        df = ingestion.load_data(image_path, file_type=image_path.split('.')[-1])
        return df
    except Exception as e:
        print(f"Error extracting table: {e}")
        return pd.DataFrame()

def save_to_csv(df, output_path):
    """
    Save the extracted data to a CSV file
    
    Args:
        df: pandas DataFrame containing the table data
        output_path: Path where the CSV file will be saved
    """
    df.to_csv(output_path, index=False)
    print(f"Table data saved to {output_path}")

if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Extract tables from images and convert to CSV")
    parser.add_argument("image_path", help="Path to the image file containing a table")
    parser.add_argument("--output", default="extracted_table.csv", 
                        help="Output CSV file path (default: extracted_table.csv)")
    parser.add_argument("--no-gemini", action="store_true", 
                        help="Disable Gemini API and use OCR only")
    parser.add_argument("--verbose", action="store_true", 
                        help="Print verbose output")
    
    args = parser.parse_args()
    
    image_path = args.image_path
    output_path = args.output
    use_gemini = not args.no_gemini
    verbose = args.verbose
    
    # Extract table and save to CSV
    print(f"Extracting table from {image_path}...")
    print(f"Using Gemini API: {'No' if args.no_gemini else 'Yes'}")
    
    try:
        # Extract table
        table_df = extract_table_from_image(image_path, use_gemini, verbose)
        
        if table_df.empty:
            print("No table data extracted.")
        else:
            # Display the extracted table
            print("\nExtracted table data:")
            print(f"Shape: {table_df.shape}")
            print(table_df.head())
            
            # Save to CSV
            save_to_csv(table_df, output_path)
            
    except Exception as e:
        print(f"An error occurred: {e}")