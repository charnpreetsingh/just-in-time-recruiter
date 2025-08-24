# Use Python 3.13 slim as base image
FROM python:3.13-slim

# Install Node.js (required for MCP servers)
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy agent files
COPY .env .env
COPY ./agent ./agent
COPY ./mcp-servers/ ./mcp-servers

# Install Python dependencies
WORKDIR /app/agent
RUN pip install --no-cache-dir -r requirements.txt 

WORKDIR /app/mcp-servers
RUN cd mixrank-api && npm install && cd ../sixtyfour-api && npm install
RUN ls mixrank-api/
RUN ls sixtyfour-api/

# Copy MCP servers from parent context (requires building from root)
# This Dockerfile should be run from the project root with:
# docker build -f agent/Dockerfile -t recruiting-agent .

# Set final working directory back to agent
WORKDIR /app

# Expose any necessary ports (if needed for future web interface)
EXPOSE 8000

# Run the agent
CMD ["python", "agent/main.py"]