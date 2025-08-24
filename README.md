# Just-in-Time Recruiter

An AI-powered recruiting agent that uses real-time signals to identify optimal timing for candidate outreach.

## Architecture

- **Frontend**: React + TypeScript + Vite with shadcn/ui components
- **Backend**: (To be implemented later)
- **Agent**: Autonomous LangChain agent with Anthropic Claude
- **MCP Servers**: Custom servers for SixtyFour API and Mixrank API integration

## Components

### 1. Frontend (`/frontend`)
React application for the recruiting dashboard and user interface.

### 2. Autonomous Agent (`/agent`)
LangChain-powered agent using Anthropic Claude that:
- Monitors talent pools and hiring signals
- Identifies optimal outreach timing
- Generates personalized messages
- Runs automated recruiting cycles

### 3. MCP Servers
Custom Model Context Protocol servers for external API integration:

#### SixtyFour API Server (`/mcp-servers/sixtyfour-api`)
- Candidate search and profiling
- Talent market insights
- Skills matching

#### Mixrank API Server (`/mcp-servers/mixrank-api`)
- Company intelligence and profiles
- Hiring signals detection
- Growth indicators
- Technology stack analysis

## Setup

### Prerequisites
- Node.js 18+
- Python 3.8+
- API keys for:
  - Anthropic Claude
  - SixtyFour API
  - Mixrank API

### Installation

1. **Agent Setup**:
   ```bash
   cd agent
   pip install -r requirements.txt
   cp .env.example .env
   # Add your API keys to .env
   ```

2. **MCP Servers Setup**:
   ```bash
   # SixtyFour API server
   cd mcp-servers/sixtyfour-api
   npm install
   
   # Mixrank API server
   cd ../mixrank-api
   npm install
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Running the System

#### Option 1: Manual Setup

1. Start MCP servers (in separate terminals):
   ```bash
   # Terminal 1
   cd mcp-servers/sixtyfour-api && npm start
   
   # Terminal 2
   cd mcp-servers/mixrank-api && npm start
   ```

2. Run the autonomous agent:
   ```bash
   cd agent
   python main.py
   ```

3. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

#### Option 2: Docker (Agent Only)

1. Build and run the agent with Docker:
   ```bash
   docker build -t recruiting-agent ./agent
   docker run --env-file .env recruiting-agent
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

> **Note**: The Docker option runs the agent with embedded MCP servers, so no need to start them separately.

## Configuration

Create `.env` files in the `agent` directory with:
```
ANTHROPIC_API_KEY=your_anthropic_api_key
SIXTYFOUR_API_KEY=your_sixtyfour_api_key
MIXRANK_API_KEY=your_mixrank_api_key
```

## Features

- **Real-time Talent Monitoring**: Continuous scanning of candidate pools
- **Company Intelligence**: Growth signals and hiring pattern analysis  
- **Optimal Timing**: AI-driven timing optimization for outreach
- **Personalized Messaging**: Context-aware message generation
- **Automated Workflows**: Scheduled recruiting cycles