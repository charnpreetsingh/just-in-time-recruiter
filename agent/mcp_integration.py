import asyncio
import json
from dotenv import load_dotenv
from typing import List, Dict, Any
from langchain.tools import StructuredTool
import logging
from anthropic import Anthropic
import os
import subprocess

logger = logging.getLogger(__name__)
load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class MCPToolWrapper:
    """Wrapper to integrate MCP servers with LangChain tools"""

    def __init__(self, server_path: str, server_name: str):
        self.server_path = server_path
        self.server_name = server_name
        self.process = None
        self.tools = []

    async def start_server(self):
        """Start the MCP server process"""
        try:
            self.process = subprocess.Popen(
                ["node", self.server_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            logger.info(f"Started MCP server: {self.server_name}")

            # Give the server a moment to start up
            await asyncio.sleep(0.5)

            # Check if process is still running
            if self.process.returncode is not None:
                stderr_output = self.process.stderr.read()
                logger.error(
                    f"MCP server {self.server_name} exited with code {self.process.returncode}"
                )
                logger.error(f"Stderr: {stderr_output.decode()}")
                return

            await self._initialize_tools()
        except Exception as e:
            logger.error(f"Failed to start MCP server {self.server_name}: {e}")

    async def _initialize_tools(self):
        """Get available tools from MCP server"""
        try:
            # Send list_tools request
            request = {"jsonrpc": "2.0", "id": 1, "method": "tools/list"}

            request_json = json.dumps(request) + "\n"
            self.process.stdin.write(request_json.encode())
            self.process.stdin.flush()

            # Read response
            response_line = self.process.stdout.readline()
            response_text = response_line.decode().strip()

            if not response_text:
                logger.error(f"Empty response from MCP server {self.server_name}")
                return

            logger.debug(f"Raw response from {self.server_name}: {response_text}")
            response = json.loads(response_text)

            if "result" in response and "tools" in response["result"]:
                for tool_info in response["result"]["tools"]:
                    langchain_tool = self._create_langchain_tool(tool_info)
                    self.tools.append(langchain_tool)

            logger.info(f"Loaded {len(self.tools)} tools from {self.server_name}")

        except Exception as e:
            logger.exception(f"Failed to initialize tools for {self.server_name}: {e}")

    def _create_langchain_tool(self, tool_info: Dict[str, Any]) -> StructuredTool:
        """Create a LangChain tool from MCP tool info"""

        def tool_function(**kwargs):
            try:
                # Send call_tool request
                request = {
                    "jsonrpc": "2.0",
                    "id": 2,
                    "method": "tools/call",
                    "params": {"name": tool_info["name"], "arguments": kwargs},
                }

                request_json = json.dumps(request) + "\n"
                self.process.stdin.write(request_json.encode())
                self.process.stdin.flush()

                # Read response
                response_line = self.process.stdout.readline()
                response = json.loads(response_line.decode().strip())

                if "result" in response:
                    content = response["result"].get("content", [])
                    if content and len(content) > 0:
                        final_resp = content[0].get("text", "No response")

                        final_summary_response = client.messages.create(
                            model="claude-3-7-sonnet-latest",
                            max_tokens=500,
                            temperature=0.3,
                            system="You are a helpful assistant that summarizes text to only the most relevant and essential details. \
                                However rather than store a vague summary, you include a list of specific details such as company names or employee names.",
                            messages=[
                                {
                                    "role": "user",
                                    "content": f"Summarize this text to less than 100 words:\n\n{final_resp}",
                                }
                            ],
                        )

                        return final_summary_response.content[0].text.strip()
                    return "No content in response"
                else:
                    return f"Error: {response.get('error', 'Unknown error')}"

            except Exception as e:
                return f"Tool execution failed: {str(e)}"

        return StructuredTool(
            name=tool_info["name"],
            description=tool_info["description"],
            args_schema=tool_info["inputSchema"],
            func=tool_function,
        )

    async def stop_server(self):
        """Stop the MCP server process"""
        if self.process:
            self.process.terminate()
            self.process.wait()
            logger.info(f"Stopped MCP server: {self.server_name}")


class MCPManager:
    """Manages multiple MCP servers and their tools"""

    def __init__(self):
        self.servers = []
        self.all_tools = []

    def add_server(self, server_path: str, server_name: str):
        """Add an MCP server"""
        server = MCPToolWrapper(server_path, server_name)
        self.servers.append(server)

    async def start_all_servers(self):
        """Start all MCP servers and collect their tools"""
        for server in self.servers:
            await server.start_server()
            self.all_tools.extend(server.tools)

        logger.info(f"Total tools available: {len(self.all_tools)}")
        return self.all_tools

    async def stop_all_servers(self):
        """Stop all MCP servers"""
        for server in self.servers:
            await server.stop_server()


# Convenience function to set up MCP tools for the agent
async def setup_mcp_tools() -> List[StructuredTool]:
    """Set up MCP tools for the recruiting agent"""
    manager = MCPManager()

    # Add SixtyFour API server
    manager.add_server("mcp-servers/sixtyfour-api/index.js", "sixtyfour-api")

    # Add Mixrank API server
    manager.add_server("mcp-servers/mixrank-api/index.js", "mixrank-api")

    # Start servers and get tools
    tools = await manager.start_all_servers()
    return tools, manager
