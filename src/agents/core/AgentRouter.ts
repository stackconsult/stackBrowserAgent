import { logger } from '../../utils/logger';
import { AgentType, AgentParams, AgentTask, AgentStatus } from './AgentTypes';
import { BaseAgent } from './BaseAgent';

/**
 * Type for agent class constructor
 */
type AgentConstructor = new (...args: unknown[]) => BaseAgent;

/**
 * Agent router for dynamic task routing and execution
 * Maps tasks to appropriate agents and manages agent execution
 */
export class AgentRouter {
  private agents: Map<AgentType, AgentConstructor>;
  private instances: Map<AgentType, BaseAgent>;
  private taskQueue: AgentTask[];

  constructor() {
    this.agents = new Map();
    this.instances = new Map();
    this.taskQueue = [];
  }

  /**
   * Register an agent type with its constructor
   */
  public registerAgent(agentType: AgentType, agentClass: AgentConstructor): void {
    this.agents.set(agentType, agentClass);
    logger.info(`Registered agent: ${agentType}`);
  }

  /**
   * Get or create an agent instance
   */
  private getAgentInstance(agentType: AgentType): BaseAgent {
    // Check if instance already exists
    if (this.instances.has(agentType)) {
      return this.instances.get(agentType)!;
    }

    // Get agent constructor
    const AgentClass = this.agents.get(agentType);
    if (!AgentClass) {
      throw new Error(`Agent type ${agentType} is not registered`);
    }

    // Create new instance
    const instance = new AgentClass();
    this.instances.set(agentType, instance);
    
    logger.info(`Created new agent instance: ${agentType}`);
    return instance;
  }

  /**
   * Route and execute a task
   */
  public async routeTask(task: AgentTask): Promise<AgentTask> {
    logger.info(`Routing task ${task.id} to agent ${task.agentType}`);

    try {
      // Update task status
      task.status = AgentStatus.RUNNING;
      task.startedAt = new Date();

      // Get agent instance
      const agent = this.getAgentInstance(task.agentType);

      // Execute agent
      const result = await agent.execute(task.params);

      // Update task with result
      task.result = result;
      task.status = result.status;
      task.completedAt = new Date();

      logger.info(`Task ${task.id} completed with status: ${result.status}`);
      return task;

    } catch (error) {
      // Handle routing errors
      task.status = AgentStatus.FAILED;
      task.completedAt = new Date();
      task.result = {
        status: AgentStatus.FAILED,
        message: `Failed to route task: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      };

      logger.error(`Task ${task.id} failed during routing`, { error });
      return task;
    }
  }

  /**
   * Create a task for an agent
   */
  public createTask(
    agentType: AgentType,
    params: AgentParams,
    priority: number = 0
  ): AgentTask {
    const task: AgentTask = {
      id: this.generateTaskId(),
      agentType,
      params,
      priority,
      status: AgentStatus.PENDING,
      createdAt: new Date()
    };

    this.taskQueue.push(task);
    logger.info(`Created task ${task.id} for agent ${agentType}`);
    
    return task;
  }

  /**
   * Execute multiple tasks in sequence
   */
  public async executeTasks(tasks: AgentTask[]): Promise<AgentTask[]> {
    logger.info(`Executing ${tasks.length} tasks`);
    
    const results: AgentTask[] = [];
    
    for (const task of tasks) {
      const result = await this.routeTask(task);
      results.push(result);
      
      // Stop execution if a critical task fails
      if (result.status === AgentStatus.FAILED && task.priority > 5) {
        logger.warn(`Critical task ${task.id} failed, stopping execution`);
        break;
      }
    }
    
    return results;
  }

  /**
   * Get all registered agent types
   */
  public getRegisteredAgents(): AgentType[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Check if an agent type is registered
   */
  public isAgentRegistered(agentType: AgentType): boolean {
    return this.agents.has(agentType);
  }

  /**
   * Get task queue
   */
  public getTaskQueue(): AgentTask[] {
    return [...this.taskQueue];
  }

  /**
   * Clear task queue
   */
  public clearTaskQueue(): void {
    this.taskQueue = [];
    logger.info('Task queue cleared');
  }

  /**
   * Generate a unique task ID
   */
  private generateTaskId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `task-${timestamp}-${random}`;
  }

  /**
   * Get agent metadata for a specific type
   */
  public getAgentMetadata(agentType: AgentType): ReturnType<BaseAgent['getMetadata']> | null {
    try {
      const agent = this.getAgentInstance(agentType);
      return agent.getMetadata();
    } catch {
      return null;
    }
  }

  /**
   * Clear all agent instances (useful for testing)
   */
  public clearInstances(): void {
    this.instances.clear();
    logger.info('Agent instances cleared');
  }
}

/**
 * Global agent router instance
 */
export const globalRouter = new AgentRouter();
