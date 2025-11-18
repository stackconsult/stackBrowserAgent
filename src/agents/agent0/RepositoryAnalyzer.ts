import { promises as fs } from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { BaseAgent } from '../core/BaseAgent';
import { AgentType, FileInfo, Dependency, LanguageInfo, FrameworkInfo, Severity } from '../core/AgentTypes';
import { AnalyzerParams, RepositoryAnalysis, RepositoryStructure, AgentInfo, RepositoryIssue } from './types';

/**
 * Agent 0A: Repository Analyzer
 * Scans repository structure, detects languages, frameworks, and dependencies
 */
export class RepositoryAnalyzer extends BaseAgent<AnalyzerParams, RepositoryAnalysis> {
  private static readonly SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out'];
  private static readonly LANGUAGE_EXTENSIONS: Record<string, string> = {
    '.ts': 'TypeScript',
    '.js': 'JavaScript',
    '.tsx': 'TypeScript',
    '.jsx': 'JavaScript',
    '.py': 'Python',
    '.java': 'Java',
    '.go': 'Go',
    '.rs': 'Rust',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.cs': 'C#',
    '.cpp': 'C++',
    '.c': 'C',
    '.swift': 'Swift',
    '.kt': 'Kotlin'
  };

  constructor() {
    super({
      id: 'agent0a',
      name: 'Repository Analyzer',
      type: AgentType.REPOSITORY_ANALYZER,
      version: '1.0.0',
      description: 'Analyzes repository structure, languages, frameworks, and dependencies',
      capabilities: ['file-scanning', 'language-detection', 'framework-detection', 'dependency-analysis'],
      dependencies: []
    });
  }

  protected async run(params: AnalyzerParams): Promise<RepositoryAnalysis> {
    this.log('info', 'Starting repository analysis', { path: params.repositoryPath });

    // Scan repository structure
    const structure = await this.scanStructure(params.repositoryPath, params);

    // Detect languages
    const languages = this.detectLanguages(structure.codeFiles);

    // Detect frameworks
    const frameworks = await this.detectFrameworks(params.repositoryPath, structure);

    // Analyze dependencies
    const dependencies = await this.analyzeDependencies(params.repositoryPath);

    // Find existing agents
    const agents = await this.findAgents(params.repositoryPath);

    // Calculate health score
    const healthScore = this.calculateHealthScore(structure, dependencies, languages);

    // Identify issues
    const issues = await this.identifyIssues(params.repositoryPath, structure, dependencies);

    this.log('info', 'Repository analysis complete', {
      totalFiles: structure.totalFiles,
      languages: languages.length,
      frameworks: frameworks.length,
      dependencies: dependencies.length,
      healthScore
    });

    return {
      path: params.repositoryPath,
      structure,
      languages,
      frameworks,
      dependencies,
      agents,
      healthScore,
      issues,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Scan repository structure
   */
  private async scanStructure(repoPath: string, params: AnalyzerParams): Promise<RepositoryStructure> {
    this.log('info', 'Scanning repository structure');

    const files: FileInfo[] = [];
    let totalSize = 0;

    // Use glob to find all files, excluding skip directories
    const pattern = params.includeHidden ? '**/*' : '**/[^.]*';
    const maxDepth = params.maxDepth || 10;
    
    const allFiles = await glob(pattern, {
      cwd: repoPath,
      ignore: RepositoryAnalyzer.SKIP_DIRS.map(dir => `**/${dir}/**`),
      nodir: false,
      absolute: false,
      maxDepth
    });

    for (const relativePath of allFiles) {
      const fullPath = path.join(repoPath, relativePath);
      try {
        const stats = await fs.stat(fullPath);
        const ext = path.extname(relativePath);
        const name = path.basename(relativePath);

        const fileInfo: FileInfo = {
          path: relativePath,
          name,
          extension: ext,
          size: stats.size,
          type: stats.isDirectory() ? 'directory' : stats.isSymbolicLink() ? 'symlink' : 'file',
          isHidden: name.startsWith('.')
        };

        files.push(fileInfo);
        if (stats.isFile()) {
          totalSize += stats.size;
        }

        this.incrementItemsProcessed();
      } catch (error) {
        this.log('warn', `Failed to stat file: ${relativePath}`, { error });
      }
    }

    // Categorize files
    const codeFiles = files.filter(f => 
      f.type === 'file' && 
      this.isCodeFile(f.extension)
    );

    const configFiles = files.filter(f => 
      f.type === 'file' && 
      this.isConfigFile(f.name)
    );

    const documentationFiles = files.filter(f => 
      f.type === 'file' && 
      this.isDocFile(f.extension)
    );

    const testFiles = files.filter(f => 
      f.type === 'file' && 
      this.isTestFile(f.path)
    );

    const directories = files.filter(f => f.type === 'directory');

    return {
      totalFiles: files.filter(f => f.type === 'file').length,
      totalDirectories: directories.length,
      totalSize,
      files,
      codeFiles,
      configFiles,
      documentationFiles,
      testFiles
    };
  }

  /**
   * Detect programming languages
   */
  private detectLanguages(codeFiles: FileInfo[]): LanguageInfo[] {
    const languageCounts = new Map<string, { count: number; extensions: Set<string> }>();

    for (const file of codeFiles) {
      const language = RepositoryAnalyzer.LANGUAGE_EXTENSIONS[file.extension];
      if (language) {
        if (!languageCounts.has(language)) {
          languageCounts.set(language, { count: 0, extensions: new Set() });
        }
        const info = languageCounts.get(language)!;
        info.count++;
        info.extensions.add(file.extension);
      }
    }

    const totalFiles = codeFiles.length || 1;
    const languages: LanguageInfo[] = Array.from(languageCounts.entries()).map(([language, info]) => ({
      language,
      fileCount: info.count,
      percentage: (info.count / totalFiles) * 100,
      extensions: Array.from(info.extensions)
    }));

    return languages.sort((a, b) => b.fileCount - a.fileCount);
  }

  /**
   * Detect frameworks
   */
  private async detectFrameworks(repoPath: string, structure: RepositoryStructure): Promise<FrameworkInfo[]> {
    const frameworks: FrameworkInfo[] = [];

    this.log('info', 'Detecting frameworks', {
      codeFiles: structure.codeFiles.length,
      configFiles: structure.configFiles.length
    });

    // Check package.json for Node.js frameworks
    const packageJsonPath = path.join(repoPath, 'package.json');
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps['express']) {
        frameworks.push({ name: 'Express.js', version: deps['express'], type: 'backend', confidence: 1.0 });
      }
      if (deps['next']) {
        frameworks.push({ name: 'Next.js', version: deps['next'], type: 'fullstack', confidence: 1.0 });
      }
      if (deps['react']) {
        frameworks.push({ name: 'React', version: deps['react'], type: 'frontend', confidence: 1.0 });
      }
      if (deps['vue']) {
        frameworks.push({ name: 'Vue.js', version: deps['vue'], type: 'frontend', confidence: 1.0 });
      }
      if (deps['jest']) {
        frameworks.push({ name: 'Jest', version: deps['jest'], type: 'testing', confidence: 1.0 });
      }
      if (deps['typescript']) {
        frameworks.push({ name: 'TypeScript', version: deps['typescript'], type: 'build', confidence: 1.0 });
      }
    } catch {
      // package.json not found or invalid, skip
    }

    return frameworks;
  }

  /**
   * Analyze dependencies
   */
  private async analyzeDependencies(repoPath: string): Promise<Dependency[]> {
    const dependencies: Dependency[] = [];

    // Parse package.json
    const packageJsonPath = path.join(repoPath, 'package.json');
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      if (packageJson.dependencies) {
        for (const [name, version] of Object.entries(packageJson.dependencies)) {
          dependencies.push({
            name,
            version: String(version),
            type: 'runtime',
            ecosystem: 'npm'
          });
        }
      }

      if (packageJson.devDependencies) {
        for (const [name, version] of Object.entries(packageJson.devDependencies)) {
          dependencies.push({
            name,
            version: String(version),
            type: 'dev',
            ecosystem: 'npm'
          });
        }
      }
    } catch {
      // No package.json or invalid
    }

    return dependencies;
  }

  /**
   * Find existing agents in repository
   */
  private async findAgents(repoPath: string): Promise<AgentInfo[]> {
    const agents: AgentInfo[] = [];

    // Look for .agent.md files
    try {
      const agentFiles = await glob('**/*.agent.md', {
        cwd: repoPath,
        ignore: RepositoryAnalyzer.SKIP_DIRS.map(dir => `**/${dir}/**`)
      });

      for (const agentFile of agentFiles) {
        agents.push({
          path: agentFile,
          type: 'custom',
          name: path.basename(agentFile, '.agent.md')
        });
      }
    } catch {
      // No agent files found
    }

    return agents;
  }

  /**
   * Calculate repository health score (0-100)
   */
  private calculateHealthScore(
    structure: RepositoryStructure,
    dependencies: Dependency[],
    languages: LanguageInfo[]
  ): number {
    let score = 0;

    // Documentation (25 points)
    if (structure.documentationFiles.length > 0) score += 10;
    if (structure.documentationFiles.some(f => f.name.toLowerCase() === 'readme.md')) score += 15;

    // Tests (25 points)
    const testRatio = structure.testFiles.length / (structure.codeFiles.length || 1);
    score += Math.min(25, testRatio * 100);

    // Configuration (20 points)
    if (structure.configFiles.length > 0) score += 10;
    if (structure.configFiles.some(f => f.name === 'tsconfig.json')) score += 5;
    if (structure.configFiles.some(f => f.name === 'package.json')) score += 5;

    // Dependencies (15 points)
    if (dependencies.length > 0 && dependencies.length < 100) score += 15;
    else if (dependencies.length >= 100) score += 5;

    // Language diversity (15 points)
    if (languages.length === 1) score += 15;
    else if (languages.length <= 3) score += 10;
    else score += 5;

    return Math.min(100, Math.round(score));
  }

  /**
   * Identify repository issues
   */
  private async identifyIssues(
    repoPath: string,
    structure: RepositoryStructure,
    dependencies: Dependency[]
  ): Promise<RepositoryIssue[]> {
    const issues: RepositoryIssue[] = [];

    // Check for missing README
    if (!structure.documentationFiles.some(f => f.name.toLowerCase() === 'readme.md')) {
      issues.push({
        id: 'missing-readme',
        type: 'documentation',
        severity: Severity.HIGH,
        message: 'Repository is missing a README.md file',
        fixable: true,
        suggestion: 'Add a README.md file with project description and usage instructions'
      });
    }

    // Check for lack of tests
    if (structure.testFiles.length === 0 && structure.codeFiles.length > 0) {
      issues.push({
        id: 'no-tests',
        type: 'code',
        severity: Severity.MEDIUM,
        message: 'No test files found in repository',
        fixable: true,
        suggestion: 'Add test files to ensure code quality'
      });
    }

    // Check for too many dependencies
    if (dependencies.length > 150) {
      issues.push({
        id: 'too-many-deps',
        type: 'dependency',
        severity: Severity.LOW,
        message: `Repository has ${dependencies.length} dependencies, which may be excessive`,
        fixable: false,
        suggestion: 'Consider reducing dependency count to improve maintainability'
      });
    }

    return issues;
  }

  /**
   * Helper: Check if file is a code file
   */
  private isCodeFile(extension: string): boolean {
    return extension in RepositoryAnalyzer.LANGUAGE_EXTENSIONS;
  }

  /**
   * Helper: Check if file is a configuration file
   */
  private isConfigFile(filename: string): boolean {
    const configPatterns = [
      'package.json', 'tsconfig.json', 'jest.config.js', '.eslintrc',
      'webpack.config.js', 'vite.config.js', 'rollup.config.js',
      'babel.config.js', '.prettierrc', 'Dockerfile', 'docker-compose.yml'
    ];
    return configPatterns.some(pattern => 
      filename === pattern || filename.includes(pattern.replace('.', ''))
    );
  }

  /**
   * Helper: Check if file is documentation
   */
  private isDocFile(extension: string): boolean {
    return ['.md', '.txt', '.rst', '.adoc'].includes(extension);
  }

  /**
   * Helper: Check if file is a test file
   */
  private isTestFile(filePath: string): boolean {
    return filePath.includes('/test') || 
           filePath.includes('.test.') || 
           filePath.includes('.spec.') ||
           filePath.includes('__tests__');
  }
}
