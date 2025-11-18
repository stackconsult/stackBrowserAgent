import { BaseAgent } from '../core/BaseAgent';
import { AgentType } from '../core/AgentTypes';
import { MapperParams, ArchitectureMap, Component, Layer, ComponentDependency, ArchitecturePattern, RepositoryAnalysis } from './types';

/**
 * Agent 0B: Architecture Mapper
 * Maps components, creates dependency graphs, identifies layers
 */
export class ArchitectureMapper extends BaseAgent<MapperParams, ArchitectureMap> {
  constructor() {
    super({
      id: 'agent0b',
      name: 'Architecture Mapper',
      type: AgentType.ARCHITECTURE_MAPPER,
      version: '1.0.0',
      description: 'Maps repository architecture, components, and dependencies',
      capabilities: ['component-mapping', 'dependency-graphing', 'layer-detection', 'pattern-recognition'],
      dependencies: ['agent0a']
    });
  }

  protected async run(params: MapperParams): Promise<ArchitectureMap> {
    this.log('info', 'Starting architecture mapping');

    const { analysis } = params;

    // Map components
    const components = this.mapComponents(analysis);

    // Identify layers
    const layers = this.identifyLayers(components);

    // Build dependency graph
    const dependencies = this.buildDependencyGraph(components);

    // Identify entry points
    const entryPoints = this.identifyEntryPoints(analysis, components);

    // Detect architecture patterns
    const patterns = this.detectPatterns(components, layers, dependencies);

    this.log('info', 'Architecture mapping complete', {
      components: components.length,
      layers: layers.length,
      dependencies: dependencies.length,
      patterns: patterns.length
    });

    return {
      components,
      layers,
      dependencies,
      entryPoints,
      patterns
    };
  }

  /**
   * Map components from code files
   */
  private mapComponents(analysis: RepositoryAnalysis): Component[] {
    const components: Component[] = [];

    // Map source files to components
    for (const file of analysis.structure.codeFiles) {
      const componentName = this.extractComponentName(file.path);
      const layer = this.determineLayer(file.path);

      components.push({
        id: this.generateComponentId(file.path),
        name: componentName,
        type: this.inferComponentType(file.path, file.name),
        path: file.path,
        layer,
        responsibilities: this.inferResponsibilities(file.path),
        exports: [],
        imports: []
      });

      this.incrementItemsProcessed();
    }

    return components;
  }

  /**
   * Identify architectural layers
   */
  private identifyLayers(components: Component[]): Layer[] {
    const layerMap = new Map<string, Set<string>>();

    for (const component of components) {
      if (!layerMap.has(component.layer)) {
        layerMap.set(component.layer, new Set());
      }
      layerMap.get(component.layer)!.add(component.id);
    }

    const layers: Layer[] = [];
    for (const [name, componentIds] of layerMap) {
      layers.push({
        name,
        type: this.mapLayerType(name),
        components: Array.from(componentIds),
        dependencies: []
      });
    }

    return layers;
  }

  /**
   * Build dependency graph between components
   */
  private buildDependencyGraph(components: Component[]): ComponentDependency[] {
    const dependencies: ComponentDependency[] = [];

    // Simplified dependency detection based on file structure
    for (const component of components) {
      const dir = component.path.split('/').slice(0, -1).join('/');
      
      // Find components in the same directory or parent directory
      const relatedComponents = components.filter(c => 
        c.id !== component.id && 
        (c.path.startsWith(dir) || dir.startsWith(c.path.split('/').slice(0, -1).join('/')))
      );

      for (const related of relatedComponents.slice(0, 3)) { // Limit connections
        dependencies.push({
          from: component.id,
          to: related.id,
          type: 'import',
          strength: 0.5
        });
      }
    }

    return dependencies;
  }

  /**
   * Identify entry points
   */
  private identifyEntryPoints(
    analysis: RepositoryAnalysis,
    components: Component[]
  ): string[] {
    const entryPoints: string[] = [];

    // Log component count
    this.log('info', 'Identifying entry points', { componentCount: components.length });

    // Common entry point patterns
    const entryPointPatterns = [
      'index.ts', 'index.js', 'main.ts', 'main.js',
      'app.ts', 'app.js', 'server.ts', 'server.js'
    ];

    for (const file of analysis.structure.codeFiles) {
      if (entryPointPatterns.includes(file.name)) {
        entryPoints.push(file.path);
      }
    }

    return entryPoints;
  }

  /**
   * Detect architecture patterns
   */
  private detectPatterns(
    components: Component[],
    layers: Layer[],
    dependencies: ComponentDependency[]
  ): ArchitecturePattern[] {
    const patterns: ArchitecturePattern[] = [];

    // Detect layered architecture
    if (layers.length >= 2) {
      patterns.push({
        name: 'Layered Architecture',
        type: 'layered',
        confidence: 0.7,
        evidence: [`Found ${layers.length} distinct layers with ${dependencies.length} dependencies`]
      });
    }

    // Detect MVC pattern
    const hasMvc = components.some(c => c.type === 'api') &&
                   layers.some(l => l.type === 'application');
    if (hasMvc) {
      patterns.push({
        name: 'MVC Pattern',
        type: 'mvc',
        confidence: 0.6,
        evidence: ['Found API and application layers']
      });
    }

    return patterns;
  }

  /**
   * Helper: Extract component name from path
   */
  private extractComponentName(filePath: string): string {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.[^.]+$/, '');
  }

  /**
   * Helper: Determine component layer
   */
  private determineLayer(filePath: string): string {
    if (filePath.includes('/api/') || filePath.includes('/routes/')) return 'api';
    if (filePath.includes('/services/')) return 'services';
    if (filePath.includes('/models/') || filePath.includes('/entities/')) return 'data';
    if (filePath.includes('/utils/') || filePath.includes('/helpers/')) return 'utilities';
    if (filePath.includes('/middleware/')) return 'middleware';
    if (filePath.includes('/auth/')) return 'authentication';
    if (filePath.includes('/agents/')) return 'agents';
    return 'core';
  }

  /**
   * Helper: Infer component type
   */
  private inferComponentType(filePath: string, fileName: string): Component['type'] {
    if (filePath.includes('/api/') || filePath.includes('/routes/')) return 'api';
    if (filePath.includes('/services/')) return 'service';
    if (fileName.toLowerCase().includes('class')) return 'class';
    if (fileName.toLowerCase().includes('service')) return 'service';
    return 'module';
  }

  /**
   * Helper: Infer component responsibilities
   */
  private inferResponsibilities(filePath: string): string[] {
    const responsibilities: string[] = [];
    
    if (filePath.includes('/auth/')) responsibilities.push('Authentication');
    if (filePath.includes('/api/')) responsibilities.push('API handling');
    if (filePath.includes('/services/')) responsibilities.push('Business logic');
    if (filePath.includes('/utils/')) responsibilities.push('Utility functions');
    if (filePath.includes('/middleware/')) responsibilities.push('Request processing');
    if (filePath.includes('/agents/')) responsibilities.push('Agent orchestration');
    
    return responsibilities.length > 0 ? responsibilities : ['General'];
  }

  /**
   * Helper: Generate component ID
   */
  private generateComponentId(filePath: string): string {
    return `component-${filePath.replace(/[/\\]/g, '-').replace(/\.[^.]+$/, '')}`;
  }

  /**
   * Helper: Map layer type
   */
  private mapLayerType(layerName: string): Layer['type'] {
    const typeMap: Record<string, Layer['type']> = {
      'api': 'presentation',
      'services': 'application',
      'data': 'data',
      'models': 'data',
      'utilities': 'infrastructure',
      'middleware': 'infrastructure',
      'authentication': 'infrastructure',
      'agents': 'application'
    };
    
    return typeMap[layerName] || 'application';
  }
}
