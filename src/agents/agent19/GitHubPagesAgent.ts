import { promises as fs } from 'fs';
import * as path from 'path';
import { BaseAgent } from '../core/BaseAgent';
import { AgentType } from '../core/AgentTypes';
import { GitHubPagesParams, GitHubPagesResult } from './types';

/**
 * Agent 19: GitHub Pages Generator
 * Sets up GitHub Pages, generates workflows, creates site structure
 */
export class GitHubPagesAgent extends BaseAgent<GitHubPagesParams, GitHubPagesResult> {
  constructor() {
    super({
      id: 'agent19',
      name: 'GitHub Pages Generator',
      type: AgentType.GITHUB_PAGES_GENERATOR,
      version: '1.0.0',
      description: 'Generates GitHub Pages site structure and deployment workflows',
      capabilities: ['pages-setup', 'workflow-generation', 'site-structure', 'documentation-site'],
      dependencies: []
    });
  }

  protected async run(params: GitHubPagesParams): Promise<GitHubPagesResult> {
    this.log('info', 'Starting GitHub Pages generation');

    const filesCreated: string[] = [];
    let workflowsGenerated = 0;

    // Create docs directory
    const docsPath = path.join(params.repositoryPath, 'docs');
    await fs.mkdir(docsPath, { recursive: true });

    // Generate index page
    await this.generateIndexPage(params, docsPath, filesCreated);

    // Generate _config.yml for Jekyll
    await this.generateJekyllConfig(params, docsPath, filesCreated);

    // Generate GitHub Actions workflow
    await this.generateWorkflow(params, filesCreated);
    workflowsGenerated++;

    // Generate documentation if requested
    if (params.includeDocumentation) {
      await this.generateDocumentation(params, docsPath, filesCreated);
    }

    this.log('info', 'GitHub Pages generation complete', {
      filesCreated: filesCreated.length,
      workflowsGenerated
    });

    return {
      filesCreated,
      workflowsGenerated,
      success: true
    };
  }

  /**
   * Generate index page
   */
  private async generateIndexPage(
    params: GitHubPagesParams,
    docsPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const siteName = params.siteName || 'Project Documentation';
    const theme = params.theme || 'default';

    const content = `---
layout: default
title: ${siteName}
---

# ${siteName}

Welcome to the ${siteName} documentation site.

## Getting Started

This site is built with GitHub Pages and Jekyll.

## Features

- Automatic deployment via GitHub Actions
- ${theme} theme
- Responsive design
- Search functionality

## Quick Links

- [Documentation](#documentation)
- [API Reference](#api-reference)
- [Contributing](#contributing)

---

Built with ❤️ using GitHub Pages
`;

    const indexPath = path.join(docsPath, 'index.md');
    await fs.writeFile(indexPath, content);
    filesCreated.push(indexPath);
    this.incrementFilesModified();
  }

  /**
   * Generate Jekyll configuration
   */
  private async generateJekyllConfig(
    params: GitHubPagesParams,
    docsPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const siteName = params.siteName || 'Project Documentation';
    const theme = params.theme || 'default';

    const config = `title: ${siteName}
description: Documentation site for ${siteName}
theme: ${this.getJekyllTheme(theme)}
baseurl: ""
url: ""

markdown: kramdown
highlighter: rouge

plugins:
  - jekyll-feed
  - jekyll-seo-tag

exclude:
  - Gemfile
  - Gemfile.lock
  - node_modules
  - vendor
`;

    const configPath = path.join(docsPath, '_config.yml');
    await fs.writeFile(configPath, config);
    filesCreated.push(configPath);
    this.incrementFilesModified();
  }

  /**
   * Generate GitHub Actions workflow
   */
  private async generateWorkflow(
    params: GitHubPagesParams,
    filesCreated: string[]
  ): Promise<void> {
    const workflowContent = `name: Deploy GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Build with Jekyll
        uses: actions/jekyll-build-pages@v1
        with:
          source: ./docs
          destination: ./_site

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

    const workflowDir = path.join(params.repositoryPath, '.github', 'workflows');
    await fs.mkdir(workflowDir, { recursive: true });

    const workflowPath = path.join(workflowDir, 'pages.yml');
    await fs.writeFile(workflowPath, workflowContent);
    filesCreated.push(workflowPath);
    this.incrementFilesModified();
  }

  /**
   * Generate documentation pages
   */
  private async generateDocumentation(
    params: GitHubPagesParams,
    docsPath: string,
    filesCreated: string[]
  ): Promise<void> {
    // Create getting started guide
    const gettingStartedContent = `---
layout: default
title: Getting Started
---

# Getting Started

This guide will help you get started with the project.

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

Create a \`.env\` file with your configuration:

\`\`\`
PORT=3000
JWT_SECRET=your-secret-key
\`\`\`

## Running the Project

\`\`\`bash
npm run dev
\`\`\`

## Next Steps

- Read the [API Documentation](./api.html)
- Check out [Examples](./examples.html)
- Join the [Community](./community.html)
`;

    const gettingStartedPath = path.join(docsPath, 'getting-started.md');
    await fs.writeFile(gettingStartedPath, gettingStartedContent);
    filesCreated.push(gettingStartedPath);
    this.incrementFilesModified();
  }

  /**
   * Get Jekyll theme name
   */
  private getJekyllTheme(theme: string): string {
    const themeMap: Record<string, string> = {
      minimal: 'minima',
      cayman: 'jekyll-theme-cayman',
      slate: 'jekyll-theme-slate',
      default: 'minima'
    };

    return themeMap[theme] || themeMap.default;
  }
}
