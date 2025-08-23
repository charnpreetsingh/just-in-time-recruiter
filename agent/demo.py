# Import relevant functionality
from langchain.chat_models import init_chat_model
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
import random
import os
from dotenv import load_dotenv

load_dotenv()

# Create the agent
memory = MemorySaver()
model = init_chat_model(
    "anthropic:claude-3-7-sonnet-latest",
    api_key=os.getenv("ANTHROPIC_API_KEY"),
)


def get_ai_companies():
    """I return a list of the top AI companies"""
    return ["Google", "Anthropic", "Meta", "OpenAI"]


def get_recent_layoffs_from(company):
    """Get a list of people laid off from the company recently"""
    return [company + str(i) for i in range(5)]


def get_person_compatibility(role_description, person):
    """Get a number between 0 to 1 representing the person (by name) compatiblity with the role description, 1 is most compatible"""
    return random.random()


tools = [get_ai_companies, get_recent_layoffs_from, get_person_compatibility]
agent_executor = create_react_agent(model, tools, checkpointer=memory)


# Use the agent
config = {"configurable": {"thread_id": "abc123"}}

input_message = {
    "role": "user",
    "content": "I'm looking to fill a role for an AI software dev who will be working on MCP servers and with langchain. Can you see if there are any good options out there?",
}
for step in agent_executor.stream(
    {"messages": [input_message]}, config, stream_mode="values"
):
    step["messages"][-1].pretty_print()
