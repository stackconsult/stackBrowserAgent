import { logger } from '../../utils/logger';
import {
  AgentStatus,
  AgentType,
  AgentParams,
  AgentResult,
  AgentError,
  AgentMetrics,
  AgentMetadata,
  Severity
} from './AgentTypes';

/**
 * Abstract base class for all agents in the orchestration system
 * Provides common functionality for error handling, logging, and lifecycle management
 */
export abstract class BaseAgent<TParams extends AgentParams = AgentParams, TResult = unknown> {
  protected readonly metadata: AgentMetadata;
  protected metrics: AgentMetrics;

  constructor(metadata: AgentMetadata) {
    this.metadata = metadata;
    this.metrics = {
      startTime: new Date(),
      itemsProcessed: 0,
      filesModified: 0
    };
  }

  /**
   * Get agent metadata
   */
  public getMetadata(): AgentMetadata {
    return { ...this.metadata };
  }

  /**
   * Get agent type
   */
  public getType(): AgentType {
    return this.metadata.type;
  }

  /**
   * Execute the agent with given parameters
   * This is the main entry point for agent execution
   */
  public async execute(params: TParams): Promise<AgentResult> {
    this.metrics.startTime = new Date();
    logger.info(`Agent ${this.metadata.name} starting execution`, {
      agentType: this.metadata.type,
      params
    });

    try {
      // Validate parameters before execution
      await this.validateParams(params);

      // Execute the agent's specific logic
      const result = await this.run(params);

      // Calculate metrics
      this.metrics.endTime = new Date();
      this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();

      // Create success result
      const agentResult: AgentResult = {
        status: AgentStatus.SUCCESS,
        message: `Agent ${this.metadata.name} completed successfully`,
        data: result,
        metrics: { ...this.metrics },
        timestamp: new Date().toISOString()
      };

      logger.info(`Agent ${this.metadata.name} completed successfully`, {
        agentType: this.metadata.type,
        duration: this.metrics.duration
      });

      return agentResult;

    } catch (error) {
      // Handle errors and create failure result
      this.metrics.endTime = new Date();
      this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();

      const agentError = this.handleError(error);
      
      const agentResult: AgentResult = {
        status: AgentStatus.FAILED,
        message: `Agent ${this.metadata.name} failed: ${agentError.message}`,
        errors: [agentError],
        metrics: { ...this.metrics },
        timestamp: new Date().toISOString()
      };

      logger.error(`Agent ${this.metadata.name} failed`, {
        agentType: this.metadata.type,
        error: agentError
      });

      return agentResult;
    }
  }

  /**
   * Abstract method to be implemented by each agent
   * Contains the agent's specific logic
   */
  protected abstract run(params: TParams): Promise<TResult>;

  /**
   * Validate agent parameters
   * Can be overridden by specific agents for custom validation
   */
  protected async validateParams(params: TParams): Promise<void> {
    if (!params.repositoryPath) {
      throw new Error('repositoryPath is required');
    }
  }

  /**
   * Handle errors and convert them to AgentError format
   */
  protected handleError(error: unknown): AgentError {
    if (error instanceof Error) {
      return {
        code: 'AGENT_ERROR',
        message: error.message,
        severity: Severity.HIGH,
        stack: error.stack,
        context: {
          agentType: this.metadata.type,
          agentName: this.metadata.name
        }
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      severity: Severity.HIGH,
      context: {
        agentType: this.metadata.type,
        agentName: this.metadata.name
      }
    };
  }

  /**
   * Log a message with agent context
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>): void {
    logger[level](message, {
      agentType: this.metadata.type,
      agentName: this.metadata.name,
      ...meta
    });
  }

  /**
   * Update metrics
   */
  protected updateMetrics(updates: Partial<AgentMetrics>): void {
    this.metrics = { ...this.metrics, ...updates };
  }

  /**
   * Increment items processed counter
   */
  protected incrementItemsProcessed(count: number = 1): void {
    this.metrics.itemsProcessed = (this.metrics.itemsProcessed || 0) + count;
  }

  /**
   * Increment files modified counter
   */
  protected incrementFilesModified(count: number = 1): void {
    this.metrics.filesModified = (this.metrics.filesModified || 0) + count;
  }
}
