import { AgentConfig, AgentCommand, AgentResponse } from '../types';
import { BrowserManager } from './browser';
import { SessionManager } from './session';
import { NavigateCommand, ScreenshotCommand } from './commands';
import { logger, createLogger } from '../utils/logger';

export class BrowserAgent {
  private config: AgentConfig;
  private browserManager: BrowserManager;
  private sessionManager: SessionManager | null = null;
  private commands: Map<string, any> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;

    // Initialize logger
    if (config.logging) {
      Object.assign(logger, createLogger(config.logging.level, config.logging.file));
    }

    // Initialize browser manager
    this.browserManager = new BrowserManager(config.browser);

    // Register commands
    this.registerCommand('navigate', new NavigateCommand(this.browserManager));
    this.registerCommand('screenshot', new ScreenshotCommand(this.browserManager));
  }

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    try {
      logger.info('Starting Browser Agent...');

      // Launch browser
      await this.browserManager.launch();

      // Create session
      this.sessionManager = new SessionManager(this.browserManager);

      const sessionInfo = await this.sessionManager.getSessionInfo();
      logger.info('Browser Agent started successfully', sessionInfo);

      logger.info(`Session ID: ${sessionInfo.id}`);
      logger.info(`Browser: ${sessionInfo.browser.version}`);
      logger.info(`Extensions loaded: ${sessionInfo.extensions.length}`);
      sessionInfo.extensions.forEach((ext) => logger.info(`  - ${ext}`));
    } catch (error) {
      logger.error('Failed to start Browser Agent:', error);
      throw error;
    }
  }

  /**
   * Execute a command
   */
  async executeCommand(command: AgentCommand): Promise<AgentResponse> {
    const handler = this.commands.get(command.type);

    if (!handler) {
      return {
        success: false,
        error: `Unknown command: ${command.type}`,
        commandId: command.id,
      };
    }

    return await handler.execute(command);
  }

  /**
   * Register a command handler
   */
  registerCommand(type: string, handler: any): void {
    this.commands.set(type, handler);
    logger.debug(`Registered command: ${type}`);
  }

  /**
   * Get session information
   */
  async getSessionInfo() {
    if (!this.sessionManager) {
      throw new Error('Session not started');
    }
    return await this.sessionManager.getSessionInfo();
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    logger.info('Stopping Browser Agent...');

    if (this.sessionManager) {
      await this.sessionManager.endSession();
    }

    logger.info('Browser Agent stopped');
  }

  /**
   * Check if agent is running
   */
  isRunning(): boolean {
    return this.browserManager.isRunning();
  }
}
