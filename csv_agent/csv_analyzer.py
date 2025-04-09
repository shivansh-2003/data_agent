from langchain_experimental.agents import create_csv_agent
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

def analyze_csv_with_langchain(file_path):
    """
    Analyze a CSV file using LangChain's CSV agent
    
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
    
    # Create the CSV agent with LangChain
    agent = create_csv_agent(
        ChatOpenAI(temperature=0), 
        file_path, 
        verbose=True,
        allow_dangerous_code=True  # Required for executing Python code
    )
    
    print("\n=== CSV Analysis Mode ===")
    print("Type 'exit' to quit\n")
    
    while True:
        user_question = input("\nAsk a question about your CSV: ")
        if user_question.lower() in ['exit', 'quit']:
            print("Exiting. Goodbye!")
            break
        
        if user_question.strip() != "":
            print("\nProcessing your question...\n")
            try:
                response = agent.run(user_question)
                print(f"\nAnswer: {response}\n")
            except Exception as e:
                print(f"\nError: {e}\n")

if __name__ == "__main__":
    # Load environment variables
    load_dotenv()
    
    # Check OpenAI API key
    if os.getenv("OPENAI_API_KEY") is None or os.getenv("OPENAI_API_KEY") == "":
        print("OPENAI_API_KEY is not set. Please set it in your environment or .env file.")
        exit(1)
    else:
        print("OPENAI_API_KEY is set")
    
    # Get CSV file path from user
    file_path = input("Enter the path to your CSV file: ")
    analyze_csv_with_langchain(file_path)