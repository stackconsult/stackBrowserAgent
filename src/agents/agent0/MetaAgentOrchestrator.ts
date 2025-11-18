import { BaseAgent } from '../core/BaseAgent';
import { AgentType, AgentStatus, Severity } from '../core/AgentTypes';
import { globalRouter } from '../core/AgentRouter';
import { RepositoryAnalyzer } from './RepositoryAnalyzer';
import { ArchitectureMapper } from './ArchitectureMapper';
import { BuildOrchestrator } from './BuildOrchestrator';
import { OrchestrateParams, RepositoryAnalysis, ArchitectureMap, Gap, BuildPlan, BuildResult } from './types';

/**
 * Result of full orchestration
 */
export interface OrchestrationResult {
  analysis: RepositoryAnalysis;
  architecture: ArchitectureMap;
  gaps: Gap[];
  buildPlan?: BuildPlan;
  buildResult?: BuildResult;
  summary: {
    totalIssues: number;
    criticalIssues: number;
    tasksExecuted: number;
    artifactsGenerated: number;
    healthScore: number;
  };
}

/**
 * Agent 0: Meta-Agent Orchestrator
 * Main orchestration engine that coordinates all other agents
 */
export class MetaAgentOrchestrator extends BaseAgent<OrchestrateParams, OrchestrationResult> {
  constructor() {
    super({
      id: 'agent0',
      name: 'Meta-Agent Orchestrator',
      type: AgentType.META_ORCHESTRATOR,
      version: '1.0.0',
      description: 'Orchestrates repository analysis, gap detection, and automated fixes',
      capabilities: [
        'repository-analysis',
        'gap-detection',
        'build-planning',
        'agent-coordination',
        'automated-fixes'
      ],
      dependencies: ['agent0a', 'agent0b', 'agent0c']
    });
  }

  protected async run(params: OrchestrateParams): Promise<OrchestrationResult> {
    this.log('info', 'Starting meta-agent orchestration', {
      repositoryPath: params.repositoryPath,
      targetScope: params.targetScope
    });

    // Step 1: Analyze repository
    this.log('info', 'Step 1: Analyzing repository');
    const analysis = await this.analyzeRepository(params);

    // Step 2: Map architecture
    this.log('info', 'Step 2: Mapping architecture');
    const architecture = await this.mapArchitecture(params, analysis);

    // Step 3: Detect gaps
    this.log('info', 'Step 3: Detecting gaps');
    const gaps = this.detectGaps(analysis, architecture);

    // Step 4: Create build plan (if needed)
    let buildPlan: BuildPlan | undefined;
    let buildResult: BuildResult | undefined;

    if (params.targetScope === 'full' || params.targetScope === 'build') {
      this.log('info', 'Step 4: Creating build plan');
      buildPlan = this.createBuildPlan(gaps, params);

      // Step 5: Execute build plan
      if (buildPlan && !params.skipSteps?.includes('build')) {
        this.log('info', 'Step 5: Executing build plan');
        buildResult = await this.executeBuildPlan(params, buildPlan);
      }
    }

    // Create summary
    const summary = {
      totalIssues: analysis.issues.length + gaps.length,
      criticalIssues: this.countCriticalIssues(analysis, gaps),
      tasksExecuted: buildResult?.tasksCompleted || 0,
      artifactsGenerated: buildResult?.artifacts.length || 0,
      healthScore: analysis.healthScore
    };

    this.log('info', 'Meta-agent orchestration complete', summary);

    return {
      analysis,
      architecture,
      gaps,
      buildPlan,
      buildResult,
      summary
    };
  }

  /**
   * Step 1: Analyze repository
   */
  private async analyzeRepository(params: OrchestrateParams): Promise<RepositoryAnalysis> {
    const analyzer = new RepositoryAnalyzer();
    const result = await analyzer.execute({
      repositoryPath: params.repositoryPath,
      includeHidden: false,
      maxDepth: 10,
      scanDependencies: true
    });

    if (result.status !== AgentStatus.SUCCESS || !result.data) {
      throw new Error('Repository analysis failed');
    }

    return result.data as RepositoryAnalysis;
  }

  /**
   * Step 2: Map architecture
   */
  private async mapArchitecture(
    params: OrchestrateParams,
    analysis: RepositoryAnalysis
  ): Promise<ArchitectureMap> {
    const mapper = new ArchitectureMapper();
    const result = await mapper.execute({
      repositoryPath: params.repositoryPath,
      analysis,
      includeExternal: false
    });

    if (result.status !== AgentStatus.SUCCESS || !result.data) {
      throw new Error('Architecture mapping failed');
    }

    return result.data as ArchitectureMap;
  }

  /**
   * Step 3: Detect gaps in repository
   */
  private detectGaps(analysis: RepositoryAnalysis, architecture: ArchitectureMap): Gap[] {
    const gaps: Gap[] = [];
    let gapId = 1;

    // Log architecture info
    this.log('info', 'Analyzing architecture for gaps', {
      components: architecture.components.length,
      layers: architecture.layers.length
    });

    // Documentation gaps
    if (!analysis.structure.documentationFiles.some(f => f.name.toLowerCase() === 'readme.md')) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'documentation',
        severity: Severity.HIGH,
        description: 'Missing README.md file',
        impact: 'Users cannot understand project purpose and usage',
        recommendation: 'Create a comprehensive README.md with project description, installation, and usage instructions',
        estimatedEffort: 'low',
        fixable: true
      });
    }

    if (!analysis.structure.documentationFiles.some(f => f.name === 'API.md')) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'documentation',
        severity: Severity.MEDIUM,
        description: 'Missing API documentation',
        impact: 'Developers cannot easily understand API endpoints',
        recommendation: 'Create API.md documenting all endpoints, parameters, and responses',
        estimatedEffort: 'medium',
        fixable: true
      });
    }

    // Testing gaps
    if (analysis.structure.testFiles.length === 0) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'testing',
        severity: Severity.HIGH,
        description: 'No test files found',
        impact: 'Code quality and reliability cannot be verified',
        recommendation: 'Add unit and integration tests using Jest or similar framework',
        estimatedEffort: 'high',
        fixable: true
      });
    } else if (analysis.structure.testFiles.length < analysis.structure.codeFiles.length * 0.5) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'testing',
        severity: Severity.MEDIUM,
        description: 'Low test coverage',
        impact: 'Some code paths may not be tested',
        recommendation: 'Increase test coverage to at least 50% of code files',
        estimatedEffort: 'medium',
        fixable: true
      });
    }

    // Infrastructure gaps
    if (!analysis.structure.configFiles.some(f => f.name === '.github')) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'infrastructure',
        severity: Severity.MEDIUM,
        description: 'Missing GitHub Actions workflows',
        impact: 'No automated CI/CD pipeline',
        recommendation: 'Add GitHub Actions workflows for testing, building, and deployment',
        estimatedEffort: 'medium',
        fixable: true
      });
    }

    // Security gaps
    if (analysis.dependencies.some(d => d.hasVulnerabilities)) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'security',
        severity: Severity.CRITICAL,
        description: 'Dependencies with known vulnerabilities',
        impact: 'Application may be vulnerable to security exploits',
        recommendation: 'Update vulnerable dependencies to patched versions',
        estimatedEffort: 'low',
        fixable: true
      });
    }

    return gaps;
  }

  /**
   * Step 4: Create build plan from gaps
   */
  private createBuildPlan(gaps: Gap[], params: OrchestrateParams): BuildPlan {
    const tasks = globalRouter.getTaskQueue();
    const fixableGaps = gaps.filter(g => g.fixable && params.autoFix);

    return {
      id: `plan-${Date.now()}`,
      name: 'Repository Improvement Plan',
      description: `Address ${fixableGaps.length} fixable gaps in repository`,
      tasks,
      estimatedDuration: this.estimateDuration(fixableGaps),
      prerequisites: ['Repository analyzed', 'Architecture mapped'],
      expectedOutcomes: fixableGaps.map(g => g.recommendation)
    };
  }

  /**
   * Step 5: Execute build plan
   */
  private async executeBuildPlan(
    params: OrchestrateParams,
    plan: BuildPlan
  ): Promise<BuildResult> {
    const orchestrator = new BuildOrchestrator();
    const result = await orchestrator.execute({
      repositoryPath: params.repositoryPath,
      plan,
      parallel: false,
      continueOnError: true
    });

    if (result.status !== AgentStatus.SUCCESS || !result.data) {
      throw new Error('Build execution failed');
    }

    return result.data as BuildResult;
  }

  /**
   * Helper: Count critical issues
   */
  private countCriticalIssues(analysis: RepositoryAnalysis, gaps: Gap[]): number {
    const criticalAnalysisIssues = analysis.issues.filter(
      i => i.severity === Severity.CRITICAL
    ).length;
    const criticalGaps = gaps.filter(g => g.severity === Severity.CRITICAL).length;
    
    return criticalAnalysisIssues + criticalGaps;
  }

  /**
   * Helper: Estimate duration for gaps
   */
  private estimateDuration(gaps: Gap[]): number {
    const effortMinutes = {
      low: 30,
      medium: 120,
      high: 480
    };

    return gaps.reduce((total, gap) => {
      return total + effortMinutes[gap.estimatedEffort];
    }, 0);
  }
}
