# Agent Orchestration System

## Overview

The stackBrowserAgent repository includes a complete meta-agent orchestration system that provides automated repository analysis, gap detection, and intelligent fixes. The system consists of specialized agents that work together to analyze, understand, and improve your codebase.

## Architecture

### Core Infrastructure

#### BaseAgent
Abstract base class providing:
- Error handling and logging
- Lifecycle management
- Metrics collection
- Standardized execution interface

#### AgentRouter
Dynamic routing system that:
- Maps tasks to appropriate agents
- Manages agent instances
- Coordinates task execution
- Handles failures gracefully

#### Agent Types
Comprehensive TypeScript interfaces for:
- Agent parameters and results
- File information and dependencies
- Language and framework detection
- Repository structure and health

## Available Agents

### Agent 0: Meta-Agent Orchestrator
**Type:** `agent0`  
**Purpose:** Main orchestration engine

**Capabilities:**
- Full repository analysis
- Gap detection and prioritization
- Build plan generation
- Automated fix coordination

**Usage:**
```typescript
import { MetaAgentOrchestrator } from './agents';

const orchestrator = new MetaAgentOrchestrator();
const result = await orchestrator.execute({
  repositoryPath: '/path/to/repo',
  targetScope: 'full',
  autoFix: true
});
```

### Agent 0A: Repository Analyzer
**Type:** `agent0a`  
**Purpose:** Deep repository scanning and analysis

**Capabilities:**
- File structure scanning
- Language detection
- Framework identification
- Dependency analysis
- Health score calculation

**Output:**
- Total files and directories
- Code, config, documentation, and test files
- Language distribution
- Framework versions
- Dependency list
- Health score (0-100)

### Agent 0B: Architecture Mapper
**Type:** `agent0b`  
**Purpose:** Component mapping and dependency graphing

**Capabilities:**
- Component identification
- Layer detection
- Dependency graph creation
- Architecture pattern recognition

**Output:**
- Component map with types and responsibilities
- Architectural layers
- Dependency relationships
- Pattern detection (MVC, Layered, etc.)

### Agent 0C: Build Orchestrator
**Type:** `agent0c`  
**Purpose:** Build plan execution

**Capabilities:**
- Task coordination
- Artifact collection
- Error handling
- Progress tracking

**Features:**
- Sequential and parallel execution
- Continue-on-error support
- Comprehensive logging
- Artifact management

### Agent 18: UI Generator
**Type:** `agent18`  
**Purpose:** Generate user interface components

**Capabilities:**
- Landing page generation
- Dashboard creation
- API documentation pages

**Options:**
- Multiple styling themes (minimal, modern, corporate)
- Responsive designs
- Customizable branding

**Usage:**
```typescript
import { UIGeneratorAgent } from './agents';

const generator = new UIGeneratorAgent();
const result = await generator.execute({
  repositoryPath: '/path/to/repo',
  uiType: 'landing-page',
  projectName: 'My Project',
  styling: 'modern'
});
```

### Agent 19: GitHub Pages Generator
**Type:** `agent19`  
**Purpose:** Setup GitHub Pages site

**Capabilities:**
- Jekyll site configuration
- GitHub Actions workflow generation
- Documentation structure
- Theme customization

**Features:**
- Multiple Jekyll themes
- Automatic deployment
- Documentation generation
- Custom domain support

### Agent 20: Browser Extension Generator
**Type:** `agent20`  
**Purpose:** Scaffold browser extensions

**Capabilities:**
- Manifest V3 generation
- Popup UI creation
- Background service worker
- Content script scaffolding
- Options page generation

**Targets:**
- Chrome
- Firefox
- Edge
- Cross-browser compatibility

## API Integration

### REST API Endpoints

#### POST `/api/v1/agents/orchestrate`
Start full repository orchestration

**Request:**
```json
{
  "repositoryPath": "/path/to/repo",
  "targetScope": "full",
  "autoFix": true
}
```

**Response:**
```json
{
  "orchestrationId": "orch-1234567890-abc123",
  "status": "started",
  "message": "Orchestration started successfully",
  "statusUrl": "/api/v1/agents/status/orch-1234567890-abc123"
}
```

#### POST `/api/v1/agents/analyze`
Analyze repository only

**Request:**
```json
{
  "repositoryPath": "/path/to/repo"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "structure": {...},
    "languages": [...],
    "frameworks": [...],
    "dependencies": [...],
    "healthScore": 85
  }
}
```

#### GET `/api/v1/agents/status/:id`
Get orchestration status

**Response:**
```json
{
  "orchestrationId": "orch-1234567890-abc123",
  "status": "running",
  "result": null
}
```

#### GET `/api/v1/agents/types`
List available agent types

**Response:**
```json
{
  "agentTypes": [
    "agent0",
    "agent0a",
    "agent0b",
    "agent0c",
    "agent18",
    "agent19",
    "agent20"
  ]
}
```

## Authentication

All agent endpoints require JWT authentication:

```bash
# Get demo token
curl http://localhost:3000/auth/demo-token

# Use token in requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"repositoryPath":"/path/to/repo"}' \
  http://localhost:3000/api/v1/agents/analyze
```

## Programmatic Usage

### Basic Example

```typescript
import { registerAllAgents, agentRouter, AgentType } from './agents';

// Register all agents
registerAllAgents();

// Create and execute a task
const task = agentRouter.createTask(
  AgentType.REPOSITORY_ANALYZER,
  { repositoryPath: process.cwd() }
);

const result = await agentRouter.routeTask(task);
console.log(result);
```

### Advanced Example

```typescript
import { MetaAgentOrchestrator } from './agents';

async function analyzeAndFix(repoPath: string) {
  const orchestrator = new MetaAgentOrchestrator();
  
  const result = await orchestrator.execute({
    repositoryPath: repoPath,
    targetScope: 'full',
    autoFix: true,
    skipSteps: [] // Optional: skip specific steps
  });

  if (result.data) {
    console.log('Analysis:', result.data.analysis);
    console.log('Architecture:', result.data.architecture);
    console.log('Gaps:', result.data.gaps);
    console.log('Build Result:', result.data.buildResult);
    console.log('Summary:', result.data.summary);
  }
}
```

## Configuration

### Environment Variables

```bash
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
PORT=3000
NODE_ENV=production
```

### Agent Configuration

Agents can be configured via their parameters:

```typescript
const result = await analyzer.execute({
  repositoryPath: '/path/to/repo',
  includeHidden: false,      // Skip hidden files
  maxDepth: 10,              // Maximum directory depth
  scanDependencies: true     // Analyze dependencies
});
```

## Error Handling

All agents return standardized results:

```typescript
interface AgentResult {
  status: AgentStatus;       // success | failed | pending | running
  message: string;
  data?: unknown;
  errors?: AgentError[];
  warnings?: string[];
  metrics?: AgentMetrics;
  timestamp: string;
}
```

Handle errors appropriately:

```typescript
const result = await agent.execute(params);

if (result.status === 'failed') {
  console.error('Agent failed:', result.message);
  if (result.errors) {
    result.errors.forEach(error => {
      console.error(`[${error.severity}] ${error.code}: ${error.message}`);
    });
  }
}
```

## Metrics and Monitoring

Agents track execution metrics:

```typescript
interface AgentMetrics {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  resourceUsage?: {
    memory?: number;
    cpu?: number;
  };
  itemsProcessed?: number;
  filesModified?: number;
}
```

Access metrics from results:

```typescript
const result = await agent.execute(params);
console.log(`Duration: ${result.metrics?.duration}ms`);
console.log(`Files processed: ${result.metrics?.itemsProcessed}`);
```

## Best Practices

1. **Always use JWT authentication** for production API calls
2. **Handle errors gracefully** - check agent result status
3. **Use appropriate scopes** - don't run full orchestration unnecessarily
4. **Monitor metrics** - track execution time and resource usage
5. **Implement rate limiting** - prevent API abuse
6. **Log appropriately** - agents log to Winston logger
7. **Test thoroughly** - use provided test suite as examples

## Testing

Run the agent test suite:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/agents/agent0.test.ts

# Run with coverage
npm run test -- --coverage
```

## Examples

### Generate Landing Page

```typescript
import { UIGeneratorAgent } from './agents';

const generator = new UIGeneratorAgent();
await generator.execute({
  repositoryPath: process.cwd(),
  uiType: 'landing-page',
  projectName: 'My Awesome Project',
  projectDescription: 'Built with cutting-edge technology',
  styling: 'modern'
});
```

### Setup GitHub Pages

```typescript
import { GitHubPagesAgent } from './agents';

const pagesAgent = new GitHubPagesAgent();
await pagesAgent.execute({
  repositoryPath: process.cwd(),
  siteName: 'Project Documentation',
  theme: 'cayman',
  includeDocumentation: true
});
```

### Create Browser Extension

```typescript
import { BrowserExtensionAgent } from './agents';

const extAgent = new BrowserExtensionAgent();
await extAgent.execute({
  repositoryPath: process.cwd(),
  extensionName: 'My Extension',
  description: 'A useful browser extension',
  permissions: ['storage', 'tabs'],
  includePopup: true,
  includeBackgroundWorker: true,
  includeContentScript: true
});
```

## Troubleshooting

### Agent Fails to Execute

- Check repository path is valid and accessible
- Verify JWT token is valid and not expired
- Check agent logs in Winston output
- Ensure all dependencies are installed

### Missing Dependencies

```bash
npm install glob
```

### TypeScript Compilation Errors

```bash
npm run build
```

### Test Failures

```bash
# Clear jest cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --verbose
```

## Contributing

When adding new agents:

1. Extend `BaseAgent` class
2. Define type-safe parameters and results
3. Register agent in `src/agents/index.ts`
4. Add tests in `tests/agents/`
5. Update this documentation

## License

ISC - See LICENSE file for details

## Support

- GitHub Issues: https://github.com/stackconsult/stackBrowserAgent/issues
- Documentation: See API.md and ARCHITECTURE.md
- Examples: See tests/agents/ directory
