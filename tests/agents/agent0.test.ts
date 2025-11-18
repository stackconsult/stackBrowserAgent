/**
 * Tests for Agent 0: Meta-Agent Orchestrator
 */

import { MetaAgentOrchestrator } from '../../src/agents/agent0/MetaAgentOrchestrator';
import { AgentStatus } from '../../src/agents/core/AgentTypes';
import * as path from 'path';

describe('MetaAgentOrchestrator', () => {
  let orchestrator: MetaAgentOrchestrator;
  const testRepoPath = path.join(__dirname, '../..');

  beforeEach(() => {
    orchestrator = new MetaAgentOrchestrator();
  });

  describe('execute', () => {
    it('should create orchestrator instance', () => {
      expect(orchestrator).toBeDefined();
      expect(orchestrator.getMetadata().name).toBe('Meta-Agent Orchestrator');
    });

    it('should have correct agent type', () => {
      expect(orchestrator.getType()).toBe('agent0');
    });

    it('should execute analysis scope', async () => {
      const result = await orchestrator.execute({
        repositoryPath: testRepoPath,
        targetScope: 'analysis',
        autoFix: false
      });

      expect(result.status).toBe(AgentStatus.SUCCESS);
      expect(result.data).toBeDefined();
    }, 30000);
  });

  describe('metadata', () => {
    it('should have correct capabilities', () => {
      const metadata = orchestrator.getMetadata();
      expect(metadata.capabilities).toContain('repository-analysis');
      expect(metadata.capabilities).toContain('gap-detection');
      expect(metadata.capabilities).toContain('build-planning');
    });

    it('should have correct dependencies', () => {
      const metadata = orchestrator.getMetadata();
      expect(metadata.dependencies).toContain('agent0a');
      expect(metadata.dependencies).toContain('agent0b');
      expect(metadata.dependencies).toContain('agent0c');
    });
  });
});
