/**
 * Main agent system exports
 * Provides clean API for using the agent orchestration system
 */

// Core infrastructure
export * from './core';

// Agent 0: Meta-orchestrator and sub-agents
export * from './agent0';

// Specialized agents
export * from './agent18';
export * from './agent19';
export * from './agent20';

// Re-export global router for convenience
export { globalRouter as agentRouter } from './core/AgentRouter';

// Agent registration helper
import { globalRouter } from './core/AgentRouter';
import { AgentType } from './core/AgentTypes';
import { RepositoryAnalyzer } from './agent0/RepositoryAnalyzer';
import { ArchitectureMapper } from './agent0/ArchitectureMapper';
import { BuildOrchestrator } from './agent0/BuildOrchestrator';
import { MetaAgentOrchestrator } from './agent0/MetaAgentOrchestrator';
import { UIGeneratorAgent } from './agent18/UIGeneratorAgent';
import { GitHubPagesAgent } from './agent19/GitHubPagesAgent';
import { BrowserExtensionAgent } from './agent20/BrowserExtensionAgent';

/**
 * Register all agents with the global router
 */
export function registerAllAgents(): void {
  // Register Agent 0 and sub-agents
  globalRouter.registerAgent(AgentType.META_ORCHESTRATOR, MetaAgentOrchestrator as never);
  globalRouter.registerAgent(AgentType.REPOSITORY_ANALYZER, RepositoryAnalyzer as never);
  globalRouter.registerAgent(AgentType.ARCHITECTURE_MAPPER, ArchitectureMapper as never);
  globalRouter.registerAgent(AgentType.BUILD_ORCHESTRATOR, BuildOrchestrator as never);

  // Register specialized agents
  globalRouter.registerAgent(AgentType.UI_GENERATOR, UIGeneratorAgent as never);
  globalRouter.registerAgent(AgentType.GITHUB_PAGES_GENERATOR, GitHubPagesAgent as never);
  globalRouter.registerAgent(AgentType.BROWSER_EXTENSION_GENERATOR, BrowserExtensionAgent as never);
}

// Auto-register all agents on import
registerAllAgents();
