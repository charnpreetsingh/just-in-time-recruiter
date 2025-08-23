# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a just-in-time recruiting agent system that uses AI to identify optimal timing for candidate outreach. The system consists of three main components:

- **Frontend**: React + TypeScript + Vite application with shadcn/ui components for the recruiting dashboard
- **Agent**: Autonomous LangChain agent using Anthropic Claude that runs scheduled recruiting cycles
- **MCP Servers**: Custom Model Context Protocol servers for SixtyFour API (talent data) and Mixrank API (company intelligence)

## Development Commands

### Frontend (`/frontend`)
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run preview      # Preview production build
```

### Agent (`/agent`)
```bash
python main.py       # Run the autonomous recruiting agent
pip install -r requirements.txt  # Install dependencies
```

### MCP Servers
```bash
# SixtyFour API server
cd mcp-servers/sixtyfour-api && npm start

# Mixrank API server  
cd mcp-servers/mixrank-api && npm start
```

## Architecture

### Agent System
The autonomous agent (`/agent/main.py`) is built with LangChain and runs on a schedule:
- Every 30 minutes during business hours
- Daily at 9 AM and 5 PM
- Uses Claude 3 Sonnet for decision making
- Integrates with MCP servers for external API access

### MCP Server Integration
The system uses Model Context Protocol servers to connect external APIs:
- **SixtyFour**: Candidate search, profiles, talent insights
- **Mixrank**: Company intelligence, hiring signals, growth indicators

Both servers expose tools through the MCP protocol that the agent can invoke.

### Frontend Architecture
React application using:
- Vite for build tooling
- TypeScript for type safety
- shadcn/ui component library built on Radix UI
- Tailwind CSS for styling
- React Query for data fetching
- React Router for navigation

## Environment Configuration

The agent requires environment variables in `/agent/.env`:
```
ANTHROPIC_API_KEY=your_anthropic_api_key
SIXTYFOUR_API_KEY=your_sixtyfour_api_key  
MIXRANK_API_KEY=your_mixrank_api_key
```

## Running the Full System

1. Start both MCP servers in separate terminals
2. Run the autonomous agent with `python agent/main.py`
3. Start the frontend development server with `npm run dev` from `/frontend`

The agent will begin its scheduled recruiting cycles, while the frontend provides the user interface for monitoring and configuration.

## Key Components

### Agent Tasks
The recruiting agent executes four main tasks per cycle:
1. Check for new talent profiles matching job requirements
2. Analyze company hiring signals and growth indicators
3. Identify optimal timing for candidate outreach  
4. Generate personalized recruiting messages

### MCP Server Tools
Each MCP server provides specific tools:
- SixtyFour: `search_candidates`, `get_candidate_profile`, `get_talent_insights`
- Mixrank: `get_company_profile`, `get_hiring_signals`, `get_company_growth_signals`, `get_technology_stack`

The backend component is planned but not yet implemented.