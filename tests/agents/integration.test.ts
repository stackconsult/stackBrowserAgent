/**
 * Integration tests for agent system
 */

import { agentRouter, AgentType, registerAllAgents } from '../../src/agents';
import { AgentStatus } from '../../src/agents/core/AgentTypes';

describe('Agent System Integration', () => {
  beforeAll(() => {
    registerAllAgents();
  });

  describe('Agent Registration', () => {
    it('should register all agents', () => {
      const registeredAgents = agentRouter.getRegisteredAgents();
      
      expect(registeredAgents).toContain(AgentType.META_ORCHESTRATOR);
      expect(registeredAgents).toContain(AgentType.REPOSITORY_ANALYZER);
      expect(registeredAgents).toContain(AgentType.ARCHITECTURE_MAPPER);
      expect(registeredAgents).toContain(AgentType.BUILD_ORCHESTRATOR);
      expect(registeredAgents).toContain(AgentType.UI_GENERATOR);
      expect(registeredAgents).toContain(AgentType.GITHUB_PAGES_GENERATOR);
      expect(registeredAgents).toContain(AgentType.BROWSER_EXTENSION_GENERATOR);
    });

    it('should check if agents are registered', () => {
      expect(agentRouter.isAgentRegistered(AgentType.META_ORCHESTRATOR)).toBe(true);
      expect(agentRouter.isAgentRegistered(AgentType.REPOSITORY_ANALYZER)).toBe(true);
    });

    it('should get agent metadata', () => {
      const metadata = agentRouter.getAgentMetadata(AgentType.REPOSITORY_ANALYZER);
      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe('Repository Analyzer');
    });
  });

  describe('Task Creation and Routing', () => {
    it('should create a task', () => {
      const task = agentRouter.createTask(
        AgentType.REPOSITORY_ANALYZER,
        { repositoryPath: '/tmp/test' },
        5
      );

      expect(task).toBeDefined();
      expect(task.agentType).toBe(AgentType.REPOSITORY_ANALYZER);
      expect(task.status).toBe(AgentStatus.PENDING);
      expect(task.priority).toBe(5);
    });

    it('should route a task', async () => {
      const task = agentRouter.createTask(
        AgentType.REPOSITORY_ANALYZER,
        { repositoryPath: process.cwd() },
        1
      );

      const result = await agentRouter.routeTask(task);

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect([AgentStatus.SUCCESS, AgentStatus.FAILED]).toContain(result.status);
    }, 30000);
  });

  describe('Agent Router', () => {
    beforeEach(() => {
      agentRouter.clearTaskQueue();
    });

    it('should manage task queue', () => {
      agentRouter.createTask(AgentType.UI_GENERATOR, { repositoryPath: '/tmp' });
      agentRouter.createTask(AgentType.GITHUB_PAGES_GENERATOR, { repositoryPath: '/tmp' });

      const queue = agentRouter.getTaskQueue();
      expect(queue.length).toBeGreaterThanOrEqual(2);
    });

    it('should clear task queue', () => {
      agentRouter.createTask(AgentType.UI_GENERATOR, { repositoryPath: '/tmp' });
      agentRouter.clearTaskQueue();

      const queue = agentRouter.getTaskQueue();
      expect(queue.length).toBe(0);
    });
  });
});
