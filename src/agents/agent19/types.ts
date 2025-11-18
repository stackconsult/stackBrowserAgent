/**
 * Type definitions for Agent 19: GitHub Pages Generator
 */

import { AgentParams } from '../core/AgentTypes';

/**
 * GitHub Pages generation parameters
 */
export interface GitHubPagesParams extends AgentParams {
  siteName?: string;
  theme?: 'minimal' | 'cayman' | 'slate' | 'default';
  includeDocumentation?: boolean;
  includeBlog?: boolean;
  customDomain?: string;
}

/**
 * GitHub Pages generation result
 */
export interface GitHubPagesResult {
  filesCreated: string[];
  workflowsGenerated: number;
  siteUrl?: string;
  success: boolean;
}
