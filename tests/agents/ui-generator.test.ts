/**
 * Tests for UI Generator Agent
 */

import { UIGeneratorAgent } from '../../src/agents/agent18/UIGeneratorAgent';
import { AgentStatus } from '../../src/agents/core/AgentTypes';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('UIGeneratorAgent', () => {
  let generator: UIGeneratorAgent;
  const testRepoPath = path.join(__dirname, '../..');
  const outputPath = path.join(testRepoPath, 'test-ui-output');

  beforeEach(() => {
    generator = new UIGeneratorAgent();
  });

  afterEach(async () => {
    // Cleanup test output
    try {
      await fs.rm(outputPath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('execute', () => {
    it('should generate landing page', async () => {
      const result = await generator.execute({
        repositoryPath: testRepoPath,
        uiType: 'landing-page',
        outputPath,
        projectName: 'Test Project',
        styling: 'modern'
      });

      expect(result.status).toBe(AgentStatus.SUCCESS);
      expect(result.data).toBeDefined();
      expect(result.data?.filesCreated).toHaveLength(2); // HTML + CSS
    }, 10000);

    it('should generate dashboard', async () => {
      const result = await generator.execute({
        repositoryPath: testRepoPath,
        uiType: 'dashboard',
        outputPath,
        projectName: 'Dashboard'
      });

      expect(result.status).toBe(AgentStatus.SUCCESS);
      expect(result.data?.filesCreated).toBeDefined();
    }, 10000);

    it('should generate API docs', async () => {
      const result = await generator.execute({
        repositoryPath: testRepoPath,
        uiType: 'api-docs',
        outputPath
      });

      expect(result.status).toBe(AgentStatus.SUCCESS);
      expect(result.data?.filesCreated).toBeDefined();
    }, 10000);
  });

  describe('metadata', () => {
    it('should have correct agent type', () => {
      expect(generator.getType()).toBe('agent18');
    });

    it('should have correct capabilities', () => {
      const metadata = generator.getMetadata();
      expect(metadata.capabilities).toContain('landing-page-generation');
      expect(metadata.capabilities).toContain('dashboard-creation');
    });
  });
});
