import { BaseAgent } from '../core/BaseAgent';
import { AgentType, AgentStatus, AgentTask, AgentResult } from '../core/AgentTypes';
import { globalRouter } from '../core/AgentRouter';
import { BuildOrchestratorParams, BuildResult, Artifact } from './types';

/**
 * Agent 0C: Build Orchestrator
 * Executes build plans, coordinates agent tasks, collects artifacts
 */
export class BuildOrchestrator extends BaseAgent<BuildOrchestratorParams, BuildResult> {
  constructor() {
    super({
      id: 'agent0c',
      name: 'Build Orchestrator',
      type: AgentType.BUILD_ORCHESTRATOR,
      version: '1.0.0',
      description: 'Orchestrates build execution and artifact collection',
      capabilities: ['task-execution', 'artifact-collection', 'error-handling', 'progress-tracking'],
      dependencies: []
    });
  }

  protected async run(params: BuildOrchestratorParams): Promise<BuildResult> {
    this.log('info', 'Starting build orchestration', {
      planId: params.plan.id,
      taskCount: params.plan.tasks.length
    });

    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const artifacts: Artifact[] = [];
    let tasksCompleted = 0;
    let tasksFailed = 0;

    try {
      // Execute tasks
      if (params.parallel) {
        // Execute tasks in parallel (simplified - just sequential for now)
        for (const task of params.plan.tasks) {
          const result = await this.executeTask(task, params.continueOnError || false);
          
          if (result.status === AgentStatus.SUCCESS) {
            tasksCompleted++;
            if (result.data) {
              // Collect artifacts from task result
              artifacts.push(...this.extractArtifacts(result.data));
            }
          } else {
            tasksFailed++;
            if (result.errors) {
              errors.push(...result.errors.map((e: { message: string }) => e.message));
            }
            if (!params.continueOnError) {
              break; // Stop on first error
            }
          }

          if (result.warnings) {
            warnings.push(...result.warnings);
          }

          this.incrementItemsProcessed();
        }
      } else {
        // Execute tasks sequentially
        for (const task of params.plan.tasks) {
          const result = await globalRouter.routeTask(task);
          
          if (result.status === AgentStatus.SUCCESS && result.result) {
            tasksCompleted++;
            if (result.result.data) {
              artifacts.push(...this.extractArtifacts(result.result.data));
            }
            if (result.result.warnings) {
              warnings.push(...result.result.warnings);
            }
          } else if (result.result) {
            tasksFailed++;
            if (result.result.errors) {
              errors.push(...result.result.errors.map(e => e.message));
            }
            if (!params.continueOnError) {
              break;
            }
          }

          this.incrementItemsProcessed();
        }
      }

      const duration = Date.now() - startTime;
      const success = tasksFailed === 0 && tasksCompleted > 0;

      this.log('info', 'Build orchestration complete', {
        success,
        tasksCompleted,
        tasksFailed,
        duration
      });

      return {
        planId: params.plan.id,
        success,
        tasksCompleted,
        tasksFailed,
        artifacts,
        errors,
        warnings,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);

      this.log('error', 'Build orchestration failed', { error: errorMessage });

      return {
        planId: params.plan.id,
        success: false,
        tasksCompleted,
        tasksFailed: tasksFailed + 1,
        artifacts,
        errors,
        warnings,
        duration
      };
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(
    task: AgentTask,
    continueOnError: boolean
  ): Promise<AgentResult> {
    try {
      this.log('info', `Executing task: ${task.id}`, { agentType: task.agentType, continueOnError });
      
      const result = await globalRouter.routeTask(task);
      
      if (result.result) {
        return result.result;
      }

      // Return error result if no result
      return {
        status: AgentStatus.FAILED,
        message: 'Task execution returned no result',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.log('error', `Task execution failed: ${task.id}`, { error });
      
      return {
        status: AgentStatus.FAILED,
        message: `Task execution failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract artifacts from task result data
   */
  private extractArtifacts(data: unknown): Artifact[] {
    const artifacts: Artifact[] = [];

    // If data contains artifacts array, extract them
    if (typeof data === 'object' && data !== null && 'artifacts' in data) {
      const dataObj = data as { artifacts: unknown[] };
      if (Array.isArray(dataObj.artifacts)) {
        for (const artifact of dataObj.artifacts) {
          if (this.isValidArtifact(artifact)) {
            artifacts.push(artifact as Artifact);
          }
        }
      }
    }

    // If data itself looks like an artifact, add it
    if (this.isValidArtifact(data)) {
      artifacts.push(data as Artifact);
    }

    return artifacts;
  }

  /**
   * Validate if object is a valid artifact
   */
  private isValidArtifact(obj: unknown): boolean {
    if (typeof obj !== 'object' || obj === null) return false;
    
    const artifact = obj as Record<string, unknown>;
    return (
      typeof artifact.id === 'string' &&
      typeof artifact.type === 'string' &&
      typeof artifact.path === 'string'
    );
  }
}
