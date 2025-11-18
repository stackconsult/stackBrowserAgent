/**
 * Type definitions for Agent 0: Meta-Agent Orchestrator
 */

import { AgentParams, AgentTask, FileInfo, Dependency, LanguageInfo, FrameworkInfo, Severity } from '../core/AgentTypes';

/**
 * Parameters for meta-orchestrator
 */
export interface OrchestrateParams extends AgentParams {
  targetScope?: 'full' | 'analysis' | 'build' | 'test';
  skipSteps?: string[];
  autoFix?: boolean;
}

/**
 * Repository analysis result
 */
export interface RepositoryAnalysis {
  path: string;
  structure: RepositoryStructure;
  languages: LanguageInfo[];
  frameworks: FrameworkInfo[];
  dependencies: Dependency[];
  agents: AgentInfo[];
  healthScore: number;
  issues: RepositoryIssue[];
  timestamp: string;
}

/**
 * Repository structure information
 */
export interface RepositoryStructure {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  files: FileInfo[];
  codeFiles: FileInfo[];
  configFiles: FileInfo[];
  documentationFiles: FileInfo[];
  testFiles: FileInfo[];
}

/**
 * Agent information found in repository
 */
export interface AgentInfo {
  path: string;
  type: string;
  name: string;
  description?: string;
  version?: string;
}

/**
 * Repository issue
 */
export interface RepositoryIssue {
  id: string;
  type: 'code' | 'dependency' | 'configuration' | 'documentation' | 'security';
  severity: Severity;
  message: string;
  file?: string;
  line?: number;
  fixable: boolean;
  suggestion?: string;
}

/**
 * Architecture map
 */
export interface ArchitectureMap {
  components: Component[];
  layers: Layer[];
  dependencies: ComponentDependency[];
  entryPoints: string[];
  patterns: ArchitecturePattern[];
}

/**
 * Component in the architecture
 */
export interface Component {
  id: string;
  name: string;
  type: 'module' | 'class' | 'function' | 'service' | 'api' | 'database' | 'external';
  path: string;
  layer: string;
  responsibilities: string[];
  exports: string[];
  imports: string[];
}

/**
 * Architecture layer
 */
export interface Layer {
  name: string;
  type: 'infrastructure' | 'application' | 'domain' | 'presentation' | 'data';
  components: string[];
  dependencies: string[];
}

/**
 * Component dependency
 */
export interface ComponentDependency {
  from: string;
  to: string;
  type: 'import' | 'call' | 'inherit' | 'compose';
  strength: number;
}

/**
 * Architecture pattern
 */
export interface ArchitecturePattern {
  name: string;
  type: 'mvc' | 'layered' | 'microservices' | 'clean' | 'hexagonal' | 'event-driven' | 'other';
  confidence: number;
  evidence: string[];
}

/**
 * Gap in repository
 */
export interface Gap {
  id: string;
  category: 'documentation' | 'testing' | 'infrastructure' | 'security' | 'performance';
  severity: Severity;
  description: string;
  impact: string;
  recommendation: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  fixable: boolean;
}

/**
 * Build plan
 */
export interface BuildPlan {
  id: string;
  name: string;
  description: string;
  tasks: AgentTask[];
  estimatedDuration: number;
  prerequisites: string[];
  expectedOutcomes: string[];
}

/**
 * Build result
 */
export interface BuildResult {
  planId: string;
  success: boolean;
  tasksCompleted: number;
  tasksFailed: number;
  artifacts: Artifact[];
  errors: string[];
  warnings: string[];
  duration: number;
}

/**
 * Build artifact
 */
export interface Artifact {
  id: string;
  type: 'file' | 'directory' | 'report' | 'documentation' | 'deployment';
  path: string;
  size: number;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for repository analyzer
 */
export interface AnalyzerParams extends AgentParams {
  includeHidden?: boolean;
  maxDepth?: number;
  scanDependencies?: boolean;
}

/**
 * Parameters for architecture mapper
 */
export interface MapperParams extends AgentParams {
  analysis: RepositoryAnalysis;
  includeExternal?: boolean;
}

/**
 * Parameters for build orchestrator
 */
export interface BuildOrchestratorParams extends AgentParams {
  plan: BuildPlan;
  parallel?: boolean;
  continueOnError?: boolean;
}
