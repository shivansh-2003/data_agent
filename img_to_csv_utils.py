import os
import pandas as pd
from dotenv import load_dotenv
from ingestion import DataIngestion
import matplotlib.pyplot as plt
import time

def test_image_extraction(image_path, use_gemini=True, verbose=True):
    """
    Test image extraction with the updated DataIngestion class
    
    Args:
        image_path: Path to the image file
        use_gemini: Whether to use Gemini API
        verbose: Whether to print verbose output
        
    Returns:
        Extracted DataFrame
    """
    # Load environment variables
    load_dotenv()
    
    # Get Gemini API key if using Gemini
    gemini_api_key = os.environ.get("GEMINI_API_KEY") if use_gemini else None
    
    # Initialize DataIngestion
    data_ingestion = DataIngestion(verbose=verbose, gemini_api_key=gemini_api_key)
    
    # Measure extraction time
    start_time = time.time()
    
    # Extract table from image
    df = data_ingestion.load_data(image_path, file_type='png')
    
    # Calculate extraction time
    extraction_time = time.time() - start_time
    
    print(f"Extraction completed in {extraction_time:.2f} seconds")
    print(f"Extracted {len(df)} rows and {len(df.columns)} columns")
    
    # Display extracted data
    print("\nExtracted Data Preview:")
    print(df.head())
    
    return df

def compare_extraction_methods(image_path, verbose=True):
    """
    Compare extraction results with and without Gemini API
    
    Args:
        image_path: Path to the image file
        verbose: Whether to print verbose output
        
    Returns:
        Tuple of DataFrames (gemini_df, ocr_df)
    """
    print("=== Testing with Gemini API ===")
    gemini_df = test_image_extraction(image_path, use_gemini=True, verbose=verbose)
    
    print("\n=== Testing with OCR only ===")
    ocr_df = test_image_extraction(image_path, use_gemini=False, verbose=verbose)
    
    return gemini_df, ocr_df

def save_extraction_results(df, output_path="extracted_table.csv"):
    """
    Save the extracted DataFrame to CSV
    
    Args:
        df: DataFrame to save
        output_path: Path to save the CSV file
    """
    df.to_csv(output_path, index=False)
    print(f"Extraction results saved to {output_path}")

def visualize_extraction_results(df, title="Extracted Data Visualization"):
    """
    Create a simple visualization of the extracted data
    
    Args:
        df: DataFrame to visualize
        title: Title for the visualization
    """
    # Check if the DataFrame contains numeric data for visualization
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    
    if len(numeric_cols) >= 2:
        # Create a scatter plot of the first two numeric columns
        plt.figure(figsize=(10, 6))
        plt.scatter(df[numeric_cols[0]], df[numeric_cols[1]])
        plt.xlabel(numeric_cols[0])
        plt.ylabel(numeric_cols[1])
        plt.title(f"{title} - Scatter Plot")
        plt.grid(True)
        plt.show()
    elif len(numeric_cols) == 1:
        # Create a histogram for the single numeric column
        plt.figure(figsize=(10, 6))
        plt.hist(df[numeric_cols[0]], bins=10)
        plt.xlabel(numeric_cols[0])
        plt.ylabel("Frequency")
        plt.title(f"{title} - Histogram")
        plt.grid(True)
        plt.show()
    else:
        # For categorical data, create a bar chart of value counts for the first column
        if len(df.columns) > 0:
            first_col = df.columns[0]
            value_counts = df[first_col].value_counts().sort_values(ascending=False).head(10)
            
            plt.figure(figsize=(12, 6))
            value_counts.plot(kind='bar')
            plt.xlabel(first_col)
            plt.ylabel("Count")
            plt.title(f"{title} - Top Values in {first_col}")
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.show()
        else:
            print("No suitable data for visualization")

if __name__ == "__main__":
    # Example usage
    import argparse
    
    parser = argparse.ArgumentParser(description="Test image to CSV conversion")
    parser.add_argument("image_path", help="Path to the image file containing a table")
    parser.add_argument("--no-gemini", action="store_true", help="Disable Gemini API and use OCR only")
    parser.add_argument("--compare", action="store_true", help="Compare Gemini API and OCR methods")
    parser.add_argument("--output", help="Path to save CSV output", default="extracted_table.csv")
    parser.add_argument("--visualize", action="store_true", help="Visualize the extracted data")
    
    args = parser.parse_args()
    
    if args.compare:
        gemini_df, ocr_df = compare_extraction_methods(args.image_path)
        
        # Save both results
        gemini_df.to_csv("gemini_extraction.csv", index=False)
        ocr_df.to_csv("ocr_extraction.csv", index=False)
        
        # Visualize both results if requested
        if args.visualize:
            print("\n=== Gemini Extraction Visualization ===")
            visualize_extraction_results(gemini_df, "Gemini Extraction")
            
            print("\n=== OCR Extraction Visualization ===")
            visualize_extraction_results(ocr_df, "OCR Extraction")
    else:
        df = test_image_extraction(args.image_path, use_gemini=not args.no_gemini)
        
        # Save results
        save_extraction_results(df, args.output)
        
        # Visualize if requested
        if args.visualize:
            visualize_extraction_results(df) 