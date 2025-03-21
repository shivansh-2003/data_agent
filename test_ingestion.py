import os
import pandas as pd
from ingestion import DataIngestion

def test_all_file_types():
    """
    Test the DataIngestion class with various file types from the test_files folder.
    """
    # Create DataIngestion instance
    ingestion = DataIngestion(verbose=True)
    
    # Create test_files directory if it doesn't exist
    if not os.path.exists("test_files"):
        os.makedirs("test_files")
        print("Created test_files directory.")
        print("Please add your test files to this directory and run the script again.")
        return
    
    # Get all files in the test_files directory
    test_files = os.listdir("test_files")
    
    if not test_files:
        print("No files found in test_files directory.")
        print("Please add test files and run the script again.")
        return
    
    print(f"Found {len(test_files)} files in test_files directory:\n")
    for file in test_files:
        print(f"- {file}")
    
    print("\n" + "="*50 + "\n")
    
    # Process each file by type
    for file in test_files:
        file_path = os.path.join("test_files", file)
        _, extension = os.path.splitext(file)
        extension = extension.lower()[1:]  # Remove the dot
        
        print(f"Processing file: {file}")
        print(f"File type: {extension}")
        
        try:
            # Determine file type
            if extension in ['csv', 'txt']:
                file_type = 'csv'
            elif extension in ['xlsx', 'xls']:
                file_type = 'excel'
            elif extension == 'pdf':
                file_type = 'pdf'
            elif extension in ['jpg', 'jpeg', 'png', 'bmp', 'tiff']:
                file_type = 'image'
            else:
                print(f"Unsupported file type: {extension}. Skipping.")
                print("\n" + "="*50 + "\n")
                continue
            
            # Load the data
            df = ingestion.load_data(file_path, file_type=file_type)
            
            # Show data preview
            print("\nData Preview:")
            if df is not None and not df.empty:
                print(f"Shape: {df.shape}")
                print(df.head(3))
                
                # Clean the data
                print("\nCleaning data...")
                cleaned_df = ingestion.clean_data(
                    handle_missing=True,
                    handle_duplicates=True,
                    missing_strategy='auto'
                )
                
                print("\nCleaned Data Preview:")
                print(f"Shape: {cleaned_df.shape}")
                print(cleaned_df.head(3))
                
                # Save results to CSV
                output_path = os.path.join("test_files", f"{os.path.splitext(file)[0]}_processed.csv")
                cleaned_df.to_csv(output_path, index=False)
                print(f"\nProcessed data saved to: {output_path}")
            else:
                print("No data was extracted from this file.")
                
        except Exception as e:
            print(f"Error processing {file}: {str(e)}")
        
        print("\n" + "="*50 + "\n")

def interactive_test():
    """
    Interactive testing of DataIngestion with user-provided file paths.
    """
    print("="*50)
    print("DataIngestion Interactive Testing Tool")
    print("="*50)
    
    # Create DataIngestion instance
    ingestion = DataIngestion(verbose=True)
    
    # Ask for Gemini API key (optional)
    use_gemini = input("Do you want to use Google Gemini API for image table extraction? (y/n): ").lower() == 'y'
    gemini_api_key = None
    
    if use_gemini:
        gemini_api_key = input("Enter your Google Gemini API key: ")
        ingestion.gemini_api_key = gemini_api_key
    
    while True:
        print("\nSelect file type to test:")
        print("1. CSV file")
        print("2. Excel file")
        print("3. PDF file")
        print("4. Image file (JPG, PNG, etc.)")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ")
        
        if choice == '5':
            print("Exiting...")
            break
        
        if choice not in ['1', '2', '3', '4']:
            print("Invalid choice. Please try again.")
            continue
        
        # Ask for file path
        file_path = input("\nEnter the path to your file (can be in test_files directory): ")
        
        # If user doesn't provide full path, check if it's in test_files
        if not os.path.exists(file_path) and os.path.exists(os.path.join("test_files", file_path)):
            file_path = os.path.join("test_files", file_path)
            
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
        
        try:
            # Process based on choice
            if choice == '1':
                df = ingestion.load_data(file_path, file_type='csv')
            elif choice == '2':
                sheet_name = input("Enter sheet name (press Enter for default): ").strip() or None
                df = ingestion.load_data(file_path, file_type='excel', sheet_name=sheet_name)
            elif choice == '3':
                df = ingestion.load_data(file_path, file_type='pdf')
            elif choice == '4':
                df = ingestion.load_data(file_path, file_type='image')
            
            # Show data preview
            print("\nData Preview:")
            if df is not None and not df.empty:
                print(f"Shape: {df.shape}")
                print(df.head(5))
                
                # Ask if user wants to clean data
                if input("\nDo you want to clean the data? (y/n): ").lower() == 'y':
                    # Ask for cleaning strategy
                    print("\nSelect missing value strategy:")
                    print("1. Auto (recommended)")
                    print("2. Drop rows with missing values")
                    print("3. Fill with mean/mode")
                    print("4. Fill with median/mode")
                    print("5. Fill with zero/Unknown")
                    
                    strategy_choice = input("\nEnter your choice (1-5): ")
                    
                    strategy_map = {
                        '1': 'auto',
                        '2': 'drop',
                        '3': 'mean',
                        '4': 'median',
                        '5': 'zero'
                    }
                    
                    missing_strategy = strategy_map.get(strategy_choice, 'auto')
                    
                    # Clean the data
                    cleaned_df = ingestion.clean_data(
                        handle_missing=True,
                        handle_duplicates=True,
                        missing_strategy=missing_strategy
                    )
                    
                    print("\nCleaned Data Preview:")
                    print(f"Shape: {cleaned_df.shape}")
                    print(cleaned_df.head(5))
                    
                    # Ask if user wants to save cleaned data
                    if input("\nDo you want to save the cleaned data? (y/n): ").lower() == 'y':
                        save_path = input("Enter save path (or press Enter for default): ").strip()
                        
                        if not save_path:
                            # Create default path
                            filename = os.path.basename(file_path)
                            basename = os.path.splitext(filename)[0]
                            save_path = os.path.join("test_files", f"{basename}_cleaned.csv")
                        
                        cleaned_df.to_csv(save_path, index=False)
                        print(f"Cleaned data saved to: {save_path}")
            else:
                print("No data was extracted from this file.")
                
        except Exception as e:
            print(f"Error processing file: {str(e)}")

if __name__ == "__main__":
    print("DataIngestion Test Script")
    print("========================\n")
    
    choice = input("How would you like to test?\n1. Test all files in test_files folder\n2. Interactive test\nChoice (1/2): ")
    
    if choice == '1':
        test_all_file_types()
    else:
        interactive_test()