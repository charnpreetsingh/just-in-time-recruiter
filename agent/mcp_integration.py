import asyncio
import json
from typing import List, Dict, Any
from langchain.tools import StructuredTool
import logging

logger = logging.getLogger(__name__)


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
            self.process = await asyncio.create_subprocess_exec(
                "node",
                self.server_path,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            logger.info(f"Started MCP server: {self.server_name}")
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
            await self.process.stdin.drain()

            # Read response
            response_line = await self.process.stdout.readline()
            response = json.loads(response_line.decode().strip())

            if "result" in response and "tools" in response["result"]:
                for tool_info in response["result"]["tools"]:
                    langchain_tool = self._create_langchain_tool(tool_info)
                    self.tools.append(langchain_tool)

            logger.info(f"Loaded {len(self.tools)} tools from {self.server_name}")

        except Exception as e:
            logger.exception(f"Failed to initialize tools for {self.server_name}: {e}")

    def _create_langchain_tool(self, tool_info: Dict[str, Any]) -> StructuredTool:
        """Create a LangChain tool from MCP tool info"""

        async def tool_function(**kwargs):
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
                await self.process.stdin.drain()

                # Read response
                response_line = await self.process.stdout.readline()
                response = json.loads(response_line.decode().strip())

                if "result" in response:
                    content = response["result"].get("content", [])
                    if content and len(content) > 0:
                        return content[0].get("text", "No response")
                    return "No content in response"
                else:
                    return f"Error: {response.get('error', 'Unknown error')}"

            except Exception as e:
                return f"Tool execution failed: {str(e)}"

        return StructuredTool(
            name=tool_info["name"],
            description=tool_info["description"],
            args_schema=tool_info["inputSchema"],
            func=lambda **kwargs: asyncio.run(tool_function(**kwargs)),
        )

    async def stop_server(self):
        """Stop the MCP server process"""
        if self.process:
            self.process.terminate()
            await self.process.wait()
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
