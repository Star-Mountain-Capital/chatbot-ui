# Browser-use MCP Client

A modern React application that provides a user-friendly interface for interacting with Model Context Protocol (MCP) servers through Server-Sent Events (SSE).

## 🎥 Demo
https://github.com/user-attachments/assets/52ab11ad-741f-4506-99ad-9f1972a3aad1

## 🚀 Features

- **Real-time Communication**: Direct SSE connection to MCP servers
- **Interactive UI**: Clean and responsive interface built with React and Tailwind CSS
- **Theme Support**: Light and dark mode with system preference detection
- **Screenshot Preview**: Live browser screenshots from MCP server responses
- **Message History**: Persistent chat history with clear message threading
- **Request Management**: Cancel in-progress requests and clear chat history
- **Connection Management**: Easy server connection configuration

## 📋 Prerequisites

- Node.js (v18 or later)
- pnpm (recommended package manager)
- A running MCP server for connection
- Python 3.8+ (for running the example server)
-

## 🚀 Getting Started

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd browser-use-mcp-client
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Start the Development Server**

   ```bash
   pnpm dev
   ```

4. **Start the Proxy Server**

   ```bash
   ./proxy/index.js
   ```

The application will be available at `http://localhost:5173`

## 💻 Usage

## 🤖 Example MCP Server

Here's an example of a Python-based MCP server that uses browser automation:

```python
#!/usr/bin/env python3
import asyncio
from dotenv import load_dotenv
from typing import Awaitable, Callable
from mcp.server.fastmcp import FastMCP, Context
from browser_use import Agent, Browser, BrowserConfig
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables from .env file
load_dotenv()

# Initialize FastMCP server
mcp = FastMCP("browser-use")

browser = Browser(
    config=BrowserConfig(
        chrome_instance_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --remote-debugging-port=9222",
        headless=True
    )
)

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
agent = None


@mcp.tool()
async def perform_search(task: str, context: Context):
    """Perform the actual search in the background."""
    async def step_handler(state, *args):
        if len(args) != 2:
            return
        await context.session.send_log_message(
            level="info",
            data={"screenshot": state.screenshot, "result": args[0]}
        )

    asyncio.create_task(
        run_browser_agent(task=task, on_step=step_handler)
    )
    return "Processing Request"


@mcp.tool()
async def stop_search(*, context: Context):
    """Stop a running browser agent search by task ID."""
    if agent is not None:
        await agent.stop()
    return "Running Agent stopped"


async def run_browser_agent(task: str, on_step: Callable[[], Awaitable[None]]):
    """Run the browser-use agent with the specified task."""
    global agent
    try:
        agent = Agent(
            task=task,
            browser=browser,
            llm=llm,
            register_new_step_callback=on_step,
            register_done_callback=on_step,
        )

        await agent.run()
    except asyncio.CancelledError:
        return "Task was cancelled"

    except Exception as e:
        return f"Error during execution: {str(e)}"
    finally:
        await browser.close()

if __name__ == "__main__":
    mcp.run(transport="sse")
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
