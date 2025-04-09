import pandas as pd
import os
import openai
from dotenv import load_dotenv

def analyze_csv(file_path):
    """Analyze a CSV file using OpenAI API directly
    
    Args:
        file_path: Path to the CSV file
    """
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return
    
    if not file_path.lower().endswith('.csv'):
        print(f"Error: File must be a CSV file")
        return
    
    print(f"\nAnalyzing CSV file: {file_path}")
    
    # Read CSV file with pandas
    try:
        df = pd.read_csv(file_path)
        # Get basic info about the dataset
        num_rows, num_cols = df.shape
        columns = df.columns.tolist()
        
        # Create a sample of the data (first 5 rows)
        sample = df.head().to_string()
        
        print(f"Dataset has {num_rows} rows and {num_cols} columns.")
        print(f"Columns: {', '.join(columns)}")
        
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return
    
    # Start interactive session
    print("\n=== Interactive CSV Analysis Mode ===")
    print("Type 'exit' to quit\n")
    
    while True:
        user_question = input("\nAsk a question about your CSV: ")
        if user_question.lower() in ['exit', 'quit']:
            print("Exiting interactive mode. Goodbye!")
            break
        
        if user_question.strip() != "":
            print("\nProcessing your question...\n")
            
            # Create a prompt for the OpenAI API
            prompt = f"""
I have a CSV dataset with the following information:
- Number of rows: {num_rows}
- Number of columns: {num_cols}
- Column names: {', '.join(columns)}

Here's a sample of the data:
{sample}

Question: {user_question}

Please analyze the data and answer the question.
"""
            
            # Call OpenAI API
            try:
                response = openai.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a data analysis assistant that helps analyze CSV data."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0
                )
                print(f"\nAnswer: {response.choices[0].message.content}\n")
            except Exception as e:
                print(f"\nError calling OpenAI API: {e}\n")


if __name__ == "__main__":
    # Load environment variables
    load_dotenv()
    
    # Set OpenAI API key
    if os.getenv("OPENAI_API_KEY") is None or os.getenv("OPENAI_API_KEY") == "":
        print("OPENAI_API_KEY is not set. Please set it in your environment or .env file.")
        exit(1)
    else:
        openai.api_key = os.getenv("OPENAI_API_KEY")
        print("OPENAI_API_KEY is set")
    
    # Ask for file path
    file_path = input("Enter the path to your CSV file: ")
    analyze_csv(file_path)