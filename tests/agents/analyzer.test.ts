/**
 * Tests for Repository Analyzer
 */

import { RepositoryAnalyzer } from '../../src/agents/agent0/RepositoryAnalyzer';
import { AgentStatus } from '../../src/agents/core/AgentTypes';
import * as path from 'path';

describe('RepositoryAnalyzer', () => {
  let analyzer: RepositoryAnalyzer;
  const testRepoPath = path.join(__dirname, '../..');

  beforeEach(() => {
    analyzer = new RepositoryAnalyzer();
  });

  describe('execute', () => {
    it('should analyze repository structure', async () => {
      const result = await analyzer.execute({
        repositoryPath: testRepoPath,
        includeHidden: false,
        maxDepth: 10,
        scanDependencies: true
      });

      expect(result.status).toBe(AgentStatus.SUCCESS);
      expect(result.data).toBeDefined();
      
      const analysis = result.data;
      expect(analysis).toHaveProperty('structure');
      expect(analysis).toHaveProperty('languages');
      expect(analysis).toHaveProperty('dependencies');
      expect(analysis).toHaveProperty('healthScore');
    }, 30000);

    it('should detect TypeScript files', async () => {
      const result = await analyzer.execute({
        repositoryPath: testRepoPath,
        includeHidden: false,
        maxDepth: 10,
        scanDependencies: false
      });

      const analysis = result.data;
      const tsLanguage = analysis?.languages.find(l => l.language === 'TypeScript');
      expect(tsLanguage).toBeDefined();
      expect(tsLanguage?.fileCount).toBeGreaterThan(0);
    }, 30000);

    it('should calculate health score', async () => {
      const result = await analyzer.execute({
        repositoryPath: testRepoPath,
        scanDependencies: true
      });

      const analysis = result.data;
      expect(analysis?.healthScore).toBeGreaterThanOrEqual(0);
      expect(analysis?.healthScore).toBeLessThanOrEqual(100);
    }, 30000);
  });

  describe('metadata', () => {
    it('should have correct agent type', () => {
      expect(analyzer.getType()).toBe('agent0a');
    });

    it('should have correct capabilities', () => {
      const metadata = analyzer.getMetadata();
      expect(metadata.capabilities).toContain('file-scanning');
      expect(metadata.capabilities).toContain('language-detection');
      expect(metadata.capabilities).toContain('framework-detection');
    });
  });
});
