# stackBrowserAgent

🤖 A powerful Chromium-based browser automation system with extension support for building automation tools, testing frameworks, and web scraping applications.

## Features

### Core Capabilities
- ✅ **Chromium Browser Control**: Full control over Chromium browser via Puppeteer v24+
- 🔌 **Extension Support**: Load and manage browser extensions dynamically
- 🎯 **Command System**: Extensible command framework for automation tasks
- 📝 **Structured Logging**: Winston-based logging with multiple outputs
- 🔒 **Session Management**: Track and manage browser sessions
- 🎨 **TypeScript**: Full TypeScript support with type definitions
- 🧪 **Testing Ready**: Jest configuration for unit and integration tests
- 📚 **Well Documented**: Comprehensive documentation and examples

### Self-Healing & Reliability
- 🔄 **Self-Healing**: Automatic error recovery with 3-tier recovery strategies
- 📊 **Performance Tracking**: Continuous monitoring with micro-improvement suggestions
- 🔧 **Version Management**: Automatic Chromium/Puppeteer compatibility checking
- 🔁 **Retry Logic**: Exponential backoff with circuit breakers
- 🏥 **Health Monitoring**: Periodic health checks with automatic recovery

### Enterprise Security
- 🔐 **Authentication & Authorization**: Role-based access control (admin/agent/readonly)
- 🔑 **Credential Management**: AES-256-GCM encrypted storage with auto-rotation
- 🚦 **Rate Limiting**: Configurable per-agent request limits
- 📋 **Audit Logging**: Tamper-proof security event logging
- 🛡️ **Input Validation**: Comprehensive sanitization and validation

### AI/LLM Integration
- 🤖 **Ollama Integration**: Local LLM for code analysis and generation
- 💡 **Code Analysis**: Automated bug detection and security review
- ⚡ **Task Planning**: AI-powered task decomposition
- 🔍 **Error Diagnosis**: Intelligent error analysis and solutions
- 📖 **Documentation Generation**: Auto-generate comprehensive docs
- 🧪 **Test Generation**: AI-created test suites

### Automation & Orchestration
- 📋 **Task Queue**: Priority-based scheduling with dependencies
- 🎯 **State Monitoring**: Auto-detection of system state changes
- ⚙️ **Automation Rules**: Event-driven rule engine
- 💾 **Resource Management**: Automatic allocation and cleanup
- 🔄 **Auto-Scaling**: Concurrent operation management

### Error Handling
- 📊 **Error Classification**: Recoverable/degraded/fatal categorization
- 🔗 **Error Correlation**: Root cause analysis with pattern detection
- 🔮 **Predictive Detection**: Anomaly detection and error prediction
- ⏮️ **Rollback Manager**: Checkpoint-based state recovery
- 🌟 **Graceful Degradation**: Fallback handlers for critical features

### Team Coordination
- 💬 **Message Bus**: Inter-agent communication with pub/sub
- 🗂️ **Agent Registry**: Capability discovery and load balancing
- 🤝 **Task Handoff**: Seamless task transfer with state preservation
- 🧠 **Shared Memory**: Collaborative data storage (public/protected/private)
- ⚖️ **Load Balancing**: Round-robin, least-load, and random strategies

## Quick Start

### Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/stackconsult/stackBrowserAgent.git
cd stackBrowserAgent

# Install dependencies
npm install

# Build the project
npm run build

# Run the agent
npm start
```

### Development Mode

```bash
# Run with hot-reload
npm run dev
```

## Project Structure

```
stackBrowserAgent/
├── src/                    # Source code
│   ├── agent/             # Core agent logic
│   ├── extensions/        # Extension loading
│   ├── types/             # TypeScript types
│   └── utils/             # Utilities
├── extensions/            # Browser extensions
│   └── example-extension/ # Example extension
├── docs/                  # Documentation
├── tests/                 # Test files
└── scripts/               # Build scripts
```

## Documentation

### Core Documentation
- 📖 [Setup Guide](docs/setup.md) - Detailed setup instructions
- 🏗️ [Architecture](docs/architecture.md) - System architecture and design
- 🔧 [Reassembly Guide](docs/reassembly.md) - Complete reassembly instructions
- 📊 [Repository Assessment](REPOSITORY_ASSESSMENT.md) - Project assessment and roadmap

### Advanced Features
- 🔄 [Self-Healing System](docs/self-healing.md) - Error recovery and performance optimization
- 🤖 [Agentic Infrastructure](docs/agentic-infrastructure.md) - Complete guide to security, LLM, automation, error handling, and team coordination
- 💡 [Implementation Notes](IMPLEMENTATION_NOTES.md) - Technical implementation details

## Configuration

Create a `.env` file:

```env
HEADLESS=false
DEVTOOLS=false
VIEWPORT_WIDTH=1920
VIEWPORT_HEIGHT=1080
EXTENSIONS_PATH=./extensions
LOG_LEVEL=info
SERVER_PORT=3000
SERVER_HOST=localhost
```

## Usage Example

```typescript
import { BrowserAgent } from './src';

const agent = new BrowserAgent({
  browser: {
    headless: false,
    devtools: false,
    extensionsPath: './extensions',
  },
  logging: {
    level: 'info',
  },
});

// Start the agent
await agent.start();

// Execute commands
const result = await agent.executeCommand({
  type: 'navigate',
  payload: { url: 'https://example.com' },
});

console.log(result);

// Stop the agent
await agent.stop();

// Access system health and performance
const health = agent.getSystemHealth();
console.log('Browser Health:', health.browser);
console.log('Performance Metrics:', health.performance);
console.log('Improvement Suggestions:', health.improvements);
```

## Available Commands

### Navigate
Navigate to a URL:
```typescript
{
  type: 'navigate',
  payload: { url: 'https://example.com' }
}
```

### Screenshot
Capture a screenshot:
```typescript
{
  type: 'screenshot',
  payload: {
    path: './screenshot.png',
    fullPage: true
  }
}
```

## Extension Development

Create custom extensions in the `extensions/` directory:

```
extensions/my-extension/
├── manifest.json
├── background.js
├── content.js
└── popup.html
```

See the [example-extension](extensions/example-extension/) for a complete example.

## Scripts

```bash
npm run dev          # Development mode with hot-reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run the compiled agent
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code
npm run typecheck    # Type check without building
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📝 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/stackconsult/stackBrowserAgent/issues)
- 💬 [Discussions](https://github.com/stackconsult/stackBrowserAgent/discussions)

## Acknowledgments

- Built with [Puppeteer](https://pptr.dev/)
- Powered by [Chromium](https://www.chromium.org/)
- TypeScript for type safety
- Winston for logging

---

Made with ❤️ by [stackconsult](https://github.com/stackconsult)
