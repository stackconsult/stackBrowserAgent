/**
 * Type definitions for Agent 20: Browser Extension Generator
 */

import { AgentParams } from '../core/AgentTypes';

/**
 * Browser extension generation parameters
 */
export interface BrowserExtensionParams extends AgentParams {
  extensionName: string;
  description?: string;
  version?: string;
  permissions?: string[];
  browser?: 'chrome' | 'firefox' | 'edge' | 'all';
  includePopup?: boolean;
  includeOptions?: boolean;
  includeContentScript?: boolean;
  includeBackgroundWorker?: boolean;
}

/**
 * Browser extension generation result
 */
export interface BrowserExtensionResult {
  filesCreated: string[];
  manifestVersion: number;
  success: boolean;
  extensionPath: string;
}
