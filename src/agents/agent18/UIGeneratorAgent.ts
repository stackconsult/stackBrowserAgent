import { promises as fs } from 'fs';
import * as path from 'path';
import { BaseAgent } from '../core/BaseAgent';
import { AgentType } from '../core/AgentTypes';
import { UIGeneratorParams, UIGenerationResult } from './types';

/**
 * Agent 18: UI Generator
 * Generates landing pages, dashboards, and API documentation pages
 */
export class UIGeneratorAgent extends BaseAgent<UIGeneratorParams, UIGenerationResult> {
  constructor() {
    super({
      id: 'agent18',
      name: 'UI Generator',
      type: AgentType.UI_GENERATOR,
      version: '1.0.0',
      description: 'Generates user interface components and pages',
      capabilities: ['landing-page-generation', 'dashboard-creation', 'api-docs-ui'],
      dependencies: []
    });
  }

  protected async run(params: UIGeneratorParams): Promise<UIGenerationResult> {
    this.log('info', 'Starting UI generation', {
      uiType: params.uiType,
      outputPath: params.outputPath
    });

    const filesCreated: string[] = [];
    const outputPath = params.outputPath || path.join(params.repositoryPath, 'generated-ui');

    // Ensure output directory exists
    await fs.mkdir(outputPath, { recursive: true });

    // Generate based on UI type
    switch (params.uiType) {
      case 'landing-page':
        await this.generateLandingPage(params, outputPath, filesCreated);
        break;
      case 'dashboard':
        await this.generateDashboard(params, outputPath, filesCreated);
        break;
      case 'api-docs':
        await this.generateApiDocs(params, outputPath, filesCreated);
        break;
      default:
        throw new Error(`Unsupported UI type: ${params.uiType}`);
    }

    this.log('info', 'UI generation complete', {
      filesCreated: filesCreated.length
    });

    return {
      filesCreated,
      assetsGenerated: filesCreated.length
    };
  }

  /**
   * Generate landing page
   */
  private async generateLandingPage(
    params: UIGeneratorParams,
    outputPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const projectName = params.projectName || 'My Project';
    const projectDescription = params.projectDescription || 'A great project built with modern technology';
    const styling = params.styling || 'modern';

    // Generate HTML
    const htmlContent = this.createLandingPageHTML(projectName, projectDescription, styling);
    const htmlPath = path.join(outputPath, 'index.html');
    await fs.writeFile(htmlPath, htmlContent);
    filesCreated.push(htmlPath);
    this.incrementFilesModified();

    // Generate CSS
    const cssContent = this.createLandingPageCSS(styling);
    const cssPath = path.join(outputPath, 'styles.css');
    await fs.writeFile(cssPath, cssContent);
    filesCreated.push(cssPath);
    this.incrementFilesModified();

    this.log('info', 'Generated landing page', { htmlPath, cssPath });
  }

  /**
   * Generate dashboard
   */
  private async generateDashboard(
    params: UIGeneratorParams,
    outputPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const projectName = params.projectName || 'Dashboard';
    
    const htmlContent = this.createDashboardHTML(projectName);
    const htmlPath = path.join(outputPath, 'dashboard.html');
    await fs.writeFile(htmlPath, htmlContent);
    filesCreated.push(htmlPath);
    this.incrementFilesModified();

    const cssContent = this.createDashboardCSS();
    const cssPath = path.join(outputPath, 'dashboard.css');
    await fs.writeFile(cssPath, cssContent);
    filesCreated.push(cssPath);
    this.incrementFilesModified();

    this.log('info', 'Generated dashboard', { htmlPath, cssPath });
  }

  /**
   * Generate API documentation page
   */
  private async generateApiDocs(
    params: UIGeneratorParams,
    outputPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const projectName = params.projectName || 'API Documentation';
    
    const htmlContent = this.createApiDocsHTML(projectName);
    const htmlPath = path.join(outputPath, 'api-docs.html');
    await fs.writeFile(htmlPath, htmlContent);
    filesCreated.push(htmlPath);
    this.incrementFilesModified();

    const cssContent = this.createApiDocsCSS();
    const cssPath = path.join(outputPath, 'api-docs.css');
    await fs.writeFile(cssPath, cssContent);
    filesCreated.push(cssPath);
    this.incrementFilesModified();

    this.log('info', 'Generated API docs', { htmlPath, cssPath });
  }

  /**
   * Create landing page HTML
   */
  private createLandingPageHTML(
    projectName: string,
    projectDescription: string,
    styling: string
  ): string {
    // Log styling choice for debugging
    this.log('info', 'Creating landing page HTML', { projectName, styling });
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">${projectName}</div>
            <ul class="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero">
            <h1>${projectName}</h1>
            <p class="hero-description">${projectDescription}</p>
            <div class="cta-buttons">
                <button class="btn btn-primary">Get Started</button>
                <button class="btn btn-secondary">Learn More</button>
            </div>
        </section>

        <section id="features" class="features">
            <h2>Features</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <h3>Fast</h3>
                    <p>Lightning-fast performance for the best user experience</p>
                </div>
                <div class="feature-card">
                    <h3>Secure</h3>
                    <p>Built with security best practices from the ground up</p>
                </div>
                <div class="feature-card">
                    <h3>Scalable</h3>
                    <p>Designed to grow with your needs</p>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <p>&copy; 2025 ${projectName}. All rights reserved.</p>
    </footer>
</body>
</html>`;
  }

  /**
   * Create landing page CSS
   */
  private createLandingPageCSS(styling: string): string {
    const colors = this.getColorScheme(styling);
    
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: ${colors.text};
    background-color: ${colors.background};
}

.header {
    background-color: ${colors.primary};
    color: white;
    padding: 1rem 2rem;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s;
}

.nav-links a:hover {
    opacity: 0.8;
}

.hero {
    text-align: center;
    padding: 6rem 2rem;
    background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
    color: white;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero-description {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn {
    padding: 0.75rem 2rem;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.2s;
}

.btn:hover {
    transform: translateY(-2px);
}

.btn-primary {
    background-color: white;
    color: ${colors.primary};
}

.btn-secondary {
    background-color: transparent;
    color: white;
    border: 2px solid white;
}

.features {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: ${colors.primary};
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.feature-card {
    padding: 2rem;
    border-radius: 10px;
    background-color: ${colors.cardBackground};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-card h3 {
    color: ${colors.primary};
    margin-bottom: 0.5rem;
}

.footer {
    background-color: ${colors.footerBackground};
    color: ${colors.footerText};
    text-align: center;
    padding: 2rem;
    margin-top: 4rem;
}`;
  }

  /**
   * Create dashboard HTML
   */
  private createDashboardHTML(projectName: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName} - Dashboard</title>
    <link rel="stylesheet" href="dashboard.css">
</head>
<body>
    <div class="dashboard">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>${projectName}</h2>
            </div>
            <nav class="sidebar-nav">
                <ul>
                    <li class="active"><a href="#overview">Overview</a></li>
                    <li><a href="#analytics">Analytics</a></li>
                    <li><a href="#agents">Agents</a></li>
                    <li><a href="#settings">Settings</a></li>
                </ul>
            </nav>
        </aside>
        
        <main class="main-content">
            <header class="dashboard-header">
                <h1>Dashboard Overview</h1>
                <div class="user-info">
                    <span>Welcome, User</span>
                </div>
            </header>
            
            <div class="dashboard-content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Agents</h3>
                        <p class="stat-value">21</p>
                    </div>
                    <div class="stat-card">
                        <h3>Active Tasks</h3>
                        <p class="stat-value">5</p>
                    </div>
                    <div class="stat-card">
                        <h3>Success Rate</h3>
                        <p class="stat-value">98%</p>
                    </div>
                    <div class="stat-card">
                        <h3>Health Score</h3>
                        <p class="stat-value">85</p>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`;
  }

  /**
   * Create dashboard CSS
   */
  private createDashboardCSS(): string {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f5f5f5;
}

.dashboard {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background-color: #2c3e50;
    color: white;
}

.sidebar-header {
    padding: 2rem 1.5rem;
    background-color: #34495e;
}

.sidebar-nav ul {
    list-style: none;
}

.sidebar-nav li {
    padding: 0;
}

.sidebar-nav a {
    display: block;
    padding: 1rem 1.5rem;
    color: white;
    text-decoration: none;
    transition: background-color 0.2s;
}

.sidebar-nav a:hover,
.sidebar-nav .active a {
    background-color: #34495e;
}

.main-content {
    flex: 1;
}

.dashboard-header {
    background-color: white;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-content {
    padding: 2rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
    color: #7f8c8d;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
}`;
  }

  /**
   * Create API docs HTML
   */
  private createApiDocsHTML(projectName: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="api-docs.css">
</head>
<body>
    <div class="docs-container">
        <nav class="docs-sidebar">
            <h2>API Reference</h2>
            <ul>
                <li><a href="#introduction">Introduction</a></li>
                <li><a href="#authentication">Authentication</a></li>
                <li><a href="#endpoints">Endpoints</a></li>
            </ul>
        </nav>
        
        <main class="docs-content">
            <section id="introduction">
                <h1>${projectName}</h1>
                <p>Welcome to the API documentation.</p>
            </section>
            
            <section id="authentication">
                <h2>Authentication</h2>
                <p>All API requests require authentication using JWT tokens.</p>
                <pre><code>Authorization: Bearer YOUR_TOKEN</code></pre>
            </section>
            
            <section id="endpoints">
                <h2>API Endpoints</h2>
                <div class="endpoint">
                    <h3>GET /api/status</h3>
                    <p>Get agent status information.</p>
                </div>
            </section>
        </main>
    </div>
</body>
</html>`;
  }

  /**
   * Create API docs CSS
   */
  private createApiDocsCSS(): string {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
}

.docs-container {
    display: flex;
}

.docs-sidebar {
    width: 250px;
    background-color: #f8f9fa;
    padding: 2rem;
    min-height: 100vh;
}

.docs-sidebar h2 {
    margin-bottom: 1rem;
}

.docs-sidebar ul {
    list-style: none;
}

.docs-sidebar a {
    display: block;
    padding: 0.5rem 0;
    color: #333;
    text-decoration: none;
}

.docs-sidebar a:hover {
    color: #007bff;
}

.docs-content {
    flex: 1;
    padding: 3rem;
    max-width: 900px;
}

.docs-content h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.docs-content h2 {
    font-size: 2rem;
    margin: 2rem 0 1rem;
}

.docs-content h3 {
    font-size: 1.5rem;
    margin: 1.5rem 0 0.5rem;
}

.endpoint {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 5px;
    margin: 1rem 0;
}

pre {
    background-color: #2d2d2d;
    color: #f8f8f2;
    padding: 1rem;
    border-radius: 5px;
    overflow-x: auto;
}

code {
    font-family: 'Courier New', monospace;
}`;
  }

  /**
   * Get color scheme based on styling option
   */
  private getColorScheme(styling: string): Record<string, string> {
    const schemes: Record<string, Record<string, string>> = {
      minimal: {
        primary: '#000000',
        secondary: '#333333',
        text: '#333333',
        background: '#ffffff',
        cardBackground: '#f9f9f9',
        footerBackground: '#f5f5f5',
        footerText: '#666666'
      },
      modern: {
        primary: '#3498db',
        secondary: '#2980b9',
        text: '#2c3e50',
        background: '#ffffff',
        cardBackground: '#f8f9fa',
        footerBackground: '#34495e',
        footerText: '#ecf0f1'
      },
      corporate: {
        primary: '#1e3a8a',
        secondary: '#1e40af',
        text: '#1f2937',
        background: '#ffffff',
        cardBackground: '#f3f4f6',
        footerBackground: '#111827',
        footerText: '#e5e7eb'
      }
    };

    return schemes[styling] || schemes.modern;
  }
}
