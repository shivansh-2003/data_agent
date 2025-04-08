import os
from langchain.agents import AgentType, initialize_agent
from langchain_openai import ChatOpenAI
from langchain_community.tools import E2BDataAnalysisTool
from dotenv import load_dotenv

load_dotenv()
# Get API keys from environment variables
e2b_api_key = os.environ.get("E2B_API_KEY")
openai_api_key = os.environ.get("OPENAI_API_KEY")

if not e2b_api_key or not openai_api_key:
    print("Please set E2B_API_KEY and OPENAI_API_KEY environment variables")
    exit(1)

# Define callback for handling matplotlib charts
def save_artifact(artifact):
    print(f"New matplotlib chart generated: {artifact.name}")
    # Download the artifact as bytes
    file = artifact.download()
    basename = os.path.basename(artifact.name)
    
    # Save the chart to the charts directory
    with open(f"./charts/{basename}", "wb") as f:
        f.write(file)
    print(f"Chart saved to ./charts/{basename}")

# Initialize the E2B Data Analysis Tool
e2b_data_analysis_tool = E2BDataAnalysisTool(
    # Pass environment variables to the sandbox if needed
    env_vars={"MY_SECRET": "secret_value"},
    on_stdout=lambda stdout: print("stdout:", stdout),
    on_stderr=lambda stderr: print("stderr:", stderr),
    on_artifact=save_artifact,
)

# Create a function to upload a file to the sandbox
def upload_file(file_path, description):
    with open(file_path, "rb") as f:
        remote_path = e2b_data_analysis_tool.upload_file(
            file=f,
            description=description,
        )
    print(f"File uploaded: {remote_path}")
    return remote_path

# Create a function to initialize the agent
def create_agent():
    tools = [e2b_data_analysis_tool.as_tool()]
    
    llm = ChatOpenAI(model="gpt-4", temperature=0)
    agent = initialize_agent(
        tools,
        llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        verbose=True,
        handle_parsing_errors=True,
    )
    return agent

# Example usage
if __name__ == "__main__":
    # Upload a file (replace with your file path)
    file_path = "test_files/data.csv"
    description = "Data  with 1272 rows and 13 columns.\nDataFrame Shape: 1272 rows × 13 columns\n  - Company (type: object): 0 missing values (0.00%), 19 unique values\n  - TypeName (type: object): 0 missing values (0.00%), 6 unique values\n  - Ram (type: int64): 0 missing values (0.00%), range: [2 to 64], mean: 8.45\n  - Weight (type: float64): 0 missing values (0.00%), range: [0.69 to 4.7], mean: 2.04\n  - Price (type: float64): 0 missing values (0.00%), range: [9.134616325446665 to 12.69144112852859], mean: 10.83\n  - TouchScreen (type: int64): 0 missing values (0.00%), range: [0 to 1], mean: 0.15\n  - Ips (type: int64): 0 missing values (0.00%), range: [0 to 1], mean: 0.28\n  - Ppi (type: float64): 0 missing values (0.00%), range: [90.58340172449304 to 352.4651472131677], mean: 146.94\n  - Cpu_brand (type: object): 0 missing values (0.00%), 5 unique values\n  - HDD (type: int64): 0 missing values (0.00%), range: [0 to 2000], mean: 414.04\n  - SSD (type: int64): 0 missing values (0.00%), range: [0 to 1024], mean: 186.30\n  - Gpu_brand (type: object): 0 missing values (0.00%), 3 unique values\n  - Os (type: object): 0 missing values (0.00%), 3 unique values\n\nSample Data (first 5 rows):"
    remote_path = upload_file(file_path, description)
    e2b_data_analysis_tool.install_python_packages("pandas matplotlib seaborn")
    # Create the agent
    agent = create_agent()
    
    # Example query
    # Replace with your own query related to your data
    query = input("which is the most popular OS and its market share and which company has the most laptops has most total sales : ")
    response = agent.run(query)    
    
    # Install Python packages if needed
    # e2b_data_analysis_tool.install_python_packages("pandas matplotlib seaborn")
    
    # Install system packages if needed
    # e2b_data_analysis_tool.install_system_packages("sqlite3")
    
    # Run a shell command if needed
    # output = e2b_data_analysis_tool.run_command("ls -la")
    # print("Command output:", output["stdout"])
    
    # When finished, close the sandbox
    e2b_data_analysis_tool.close()