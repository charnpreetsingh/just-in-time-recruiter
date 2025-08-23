import os
import schedule
import time
import asyncio
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.prompts import ChatPromptTemplate
from langchain_community.tools import ShellTool
import logging
from mcp_integration import setup_mcp_tools

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class JustInTimeRecruitingAgent:
    def __init__(self):
        # Initialize Claude model
        self.llm = ChatAnthropic(
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
            model="claude-3-sonnet-20240229",
            temperature=0.1
        )
        
        # Define system prompt for recruiting agent
        self.system_prompt = """
        You are a just-in-time recruiting agent. Your role is to:
        1. Monitor talent pools and company hiring signals
        2. Identify optimal timing for outreach
        3. Generate personalized recruiting messages
        4. Track engagement and optimize strategies
        
        You have access to:
        - SixtyFour API for talent data
        - Mixrank API for company insights
        - Various tools for data processing and outreach
        
        Always prioritize quality matches and respectful, personalized communication.
        """
        
        self.tools = []  # Will be populated with MCP server tools
        self.agent = None
        self.mcp_manager = None
        
    async def setup_agent(self):
        """Initialize the agent with tools and prompt"""
        # Set up MCP tools
        try:
            self.tools, self.mcp_manager = await setup_mcp_tools()
            logger.info(f"Loaded {len(self.tools)} MCP tools")
        except Exception as e:
            logger.error(f"Failed to set up MCP tools: {e}")
            self.tools = []
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("placeholder", "{chat_history}"),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}"),
        ])
        
        # Create agent when tools are available
        if self.tools:
            self.agent = create_tool_calling_agent(self.llm, self.tools, prompt)
            self.executor = AgentExecutor(agent=self.agent, tools=self.tools, verbose=True)
        else:
            logger.warning("No tools available, agent will run without external tools")
    
    def run_recruiting_cycle(self):
        """Main recruiting cycle - runs periodically"""
        logger.info("Starting recruiting cycle...")
        
        if not self.agent:
            logger.warning("Agent not initialized. Setting up...")
            asyncio.run(self.setup_agent())
            return
        
        try:
            # Define the recruiting tasks
            tasks = [
                "Check for new talent profiles that match current job requirements",
                "Analyze company hiring signals and growth indicators", 
                "Identify optimal timing for candidate outreach",
                "Generate personalized recruiting messages for top matches"
            ]
            
            for task in tasks:
                logger.info(f"Executing task: {task}")
                result = self.executor.invoke({"input": task})
                logger.info(f"Task result: {result.get('output', 'No output')}")
                
        except Exception as e:
            logger.error(f"Error in recruiting cycle: {str(e)}")
    
    def start_scheduler(self):
        """Start the scheduled recruiting cycles"""
        logger.info("Starting recruiting agent scheduler...")
        
        # Schedule recruiting cycles
        schedule.every(30).minutes.do(self.run_recruiting_cycle)  # Run every 30 minutes
        schedule.every().day.at("09:00").do(self.run_recruiting_cycle)  # Daily at 9 AM
        schedule.every().day.at("17:00").do(self.run_recruiting_cycle)  # Daily at 5 PM
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

async def main():
    agent = JustInTimeRecruitingAgent()
    # Initialize agent with MCP tools
    await agent.setup_agent()
    # Start scheduler in a separate thread
    import threading
    scheduler_thread = threading.Thread(target=agent.start_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    
    try:
        # Keep the main thread alive
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        if agent.mcp_manager:
            await agent.mcp_manager.stop_all_servers()

if __name__ == "__main__":
    asyncio.run(main())