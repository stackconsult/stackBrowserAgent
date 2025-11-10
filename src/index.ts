import { config } from 'dotenv';
import { BrowserAgent } from './agent';
import { AgentConfig } from './types';

// Load environment variables
config();

// Default configuration
const agentConfig: AgentConfig = {
  browser: {
    headless: process.env.HEADLESS === 'true',
    devtools: process.env.DEVTOOLS === 'true',
    viewport: {
      width: parseInt(process.env.VIEWPORT_WIDTH || '1920', 10),
      height: parseInt(process.env.VIEWPORT_HEIGHT || '1080', 10),
    },
    extensionsPath: process.env.EXTENSIONS_PATH || './extensions',
    userDataDir: process.env.USER_DATA_DIR,
  },
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    file: process.env.LOG_FILE,
  },
  server: {
    port: parseInt(process.env.SERVER_PORT || '3000', 10),
    host: process.env.SERVER_HOST || 'localhost',
  },
};

async function main() {
  const agent = new BrowserAgent(agentConfig);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await agent.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await agent.stop();
    process.exit(0);
  });

  try {
    // Start the agent
    await agent.start();

    // Keep the process running
    console.log('Browser Agent is running. Press Ctrl+C to stop.');

    // Example: Navigate to a page
    const result = await agent.executeCommand({
      type: 'navigate',
      payload: { url: 'https://example.com' },
      id: 'example-nav-1',
    });

    console.log('Navigation result:', result);

    // Keep alive
    await new Promise(() => {});
  } catch (error) {
    console.error('Fatal error:', error);
    await agent.stop();
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  main();
}

export { BrowserAgent, AgentConfig };
