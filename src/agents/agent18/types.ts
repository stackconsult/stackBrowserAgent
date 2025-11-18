/**
 * Type definitions for Agent 18: UI Generator
 */

import { AgentParams } from '../core/AgentTypes';

/**
 * UI generation parameters
 */
export interface UIGeneratorParams extends AgentParams {
  uiType: 'landing-page' | 'dashboard' | 'api-docs';
  outputPath?: string;
  projectName?: string;
  projectDescription?: string;
  features?: string[];
  styling?: 'minimal' | 'modern' | 'corporate';
}

/**
 * UI generation result
 */
export interface UIGenerationResult {
  filesCreated: string[];
  previewUrl?: string;
  assetsGenerated: number;
}

/**
 * Page component
 */
export interface PageComponent {
  id: string;
  type: 'header' | 'hero' | 'features' | 'footer' | 'navigation' | 'content';
  content: string;
}
