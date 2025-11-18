/**
 * Core agent type definitions for the meta-agent orchestration system
 */

/**
 * Severity levels for issues and logs
 */
export enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

/**
 * Agent execution status
 */
export enum AgentStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Types of agents in the system
 */
export enum AgentType {
  META_ORCHESTRATOR = 'agent0',
  REPOSITORY_ANALYZER = 'agent0a',
  ARCHITECTURE_MAPPER = 'agent0b',
  BUILD_ORCHESTRATOR = 'agent0c',
  UI_GENERATOR = 'agent18',
  GITHUB_PAGES_GENERATOR = 'agent19',
  BROWSER_EXTENSION_GENERATOR = 'agent20'
}

/**
 * Base parameters for agent execution
 */
export interface AgentParams {
  repositoryPath: string;
  options?: Record<string, unknown>;
}

/**
 * Base result from agent execution
 */
export interface AgentResult {
  status: AgentStatus;
  message: string;
  data?: unknown;
  errors?: AgentError[];
  warnings?: string[];
  metrics?: AgentMetrics;
  timestamp: string;
}

/**
 * Agent error information
 */
export interface AgentError {
  code: string;
  message: string;
  severity: Severity;
  context?: Record<string, unknown>;
  stack?: string;
}

/**
 * Agent execution metrics
 */
export interface AgentMetrics {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  resourceUsage?: {
    memory?: number;
    cpu?: number;
  };
  itemsProcessed?: number;
  filesModified?: number;
}

/**
 * Agent metadata
 */
export interface AgentMetadata {
  id: string;
  name: string;
  type: AgentType;
  version: string;
  description: string;
  capabilities: string[];
  dependencies: string[];
}

/**
 * Task for agent execution
 */
export interface AgentTask {
  id: string;
  agentType: AgentType;
  params: AgentParams;
  priority: number;
  status: AgentStatus;
  result?: AgentResult;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Repository file information
 */
export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  type: 'file' | 'directory' | 'symlink';
  isHidden: boolean;
}

/**
 * Dependency information
 */
export interface Dependency {
  name: string;
  version: string;
  type: 'runtime' | 'dev' | 'peer' | 'optional';
  ecosystem: 'npm' | 'pip' | 'maven' | 'go' | 'cargo' | 'other';
  hasVulnerabilities?: boolean;
  isOutdated?: boolean;
}

/**
 * Language detection result
 */
export interface LanguageInfo {
  language: string;
  fileCount: number;
  percentage: number;
  extensions: string[];
}

/**
 * Framework detection result
 */
export interface FrameworkInfo {
  name: string;
  version?: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'testing' | 'build' | 'other';
  confidence: number;
}

/**
 * Agent capability
 */
export interface AgentCapability {
  name: string;
  description: string;
  requiredInputs: string[];
  outputs: string[];
}
