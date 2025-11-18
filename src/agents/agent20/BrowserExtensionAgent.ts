import { promises as fs } from 'fs';
import * as path from 'path';
import { BaseAgent } from '../core/BaseAgent';
import { AgentType } from '../core/AgentTypes';
import { BrowserExtensionParams, BrowserExtensionResult } from './types';

/**
 * Agent 20: Browser Extension Generator
 * Scaffolds browser extensions with Manifest V3, background workers, popups, content scripts
 */
export class BrowserExtensionAgent extends BaseAgent<BrowserExtensionParams, BrowserExtensionResult> {
  constructor() {
    super({
      id: 'agent20',
      name: 'Browser Extension Generator',
      type: AgentType.BROWSER_EXTENSION_GENERATOR,
      version: '1.0.0',
      description: 'Generates browser extension scaffolding with Manifest V3',
      capabilities: ['extension-scaffold', 'manifest-generation', 'popup-ui', 'content-scripts', 'background-workers'],
      dependencies: []
    });
  }

  protected async run(params: BrowserExtensionParams): Promise<BrowserExtensionResult> {
    this.log('info', 'Starting browser extension generation', {
      extensionName: params.extensionName
    });

    const filesCreated: string[] = [];
    const extensionPath = path.join(params.repositoryPath, 'browser-extension');

    // Create extension directory
    await fs.mkdir(extensionPath, { recursive: true });

    // Generate manifest.json (V3)
    await this.generateManifest(params, extensionPath, filesCreated);

    // Generate popup if requested
    if (params.includePopup !== false) {
      await this.generatePopup(params, extensionPath, filesCreated);
    }

    // Generate background worker if requested
    if (params.includeBackgroundWorker !== false) {
      await this.generateBackgroundWorker(params, extensionPath, filesCreated);
    }

    // Generate content script if requested
    if (params.includeContentScript) {
      await this.generateContentScript(params, extensionPath, filesCreated);
    }

    // Generate options page if requested
    if (params.includeOptions) {
      await this.generateOptionsPage(params, extensionPath, filesCreated);
    }

    // Generate icons placeholder
    await this.generateIconsInfo(params, extensionPath, filesCreated);

    this.log('info', 'Browser extension generation complete', {
      filesCreated: filesCreated.length
    });

    return {
      filesCreated,
      manifestVersion: 3,
      success: true,
      extensionPath
    };
  }

  /**
   * Generate manifest.json with Manifest V3
   */
  private async generateManifest(
    params: BrowserExtensionParams,
    extensionPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const manifest = {
      manifest_version: 3,
      name: params.extensionName,
      description: params.description || 'A browser extension',
      version: params.version || '1.0.0',
      icons: {
        16: 'icons/icon16.png',
        48: 'icons/icon48.png',
        128: 'icons/icon128.png'
      },
      action: params.includePopup !== false ? {
        default_popup: 'popup/popup.html',
        default_icon: {
          16: 'icons/icon16.png',
          48: 'icons/icon48.png'
        }
      } : undefined,
      background: params.includeBackgroundWorker !== false ? {
        service_worker: 'background/background.js',
        type: 'module'
      } : undefined,
      content_scripts: params.includeContentScript ? [{
        matches: ['<all_urls>'],
        js: ['content/content.js']
      }] : undefined,
      options_page: params.includeOptions ? 'options/options.html' : undefined,
      permissions: params.permissions || ['storage']
    };

    const manifestPath = path.join(extensionPath, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    filesCreated.push(manifestPath);
    this.incrementFilesModified();
  }

  /**
   * Generate popup UI
   */
  private async generatePopup(
    params: BrowserExtensionParams,
    extensionPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const popupDir = path.join(extensionPath, 'popup');
    await fs.mkdir(popupDir, { recursive: true });

    // HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${params.extensionName}</title>
    <link rel="stylesheet" href="popup.css">
</head>
<body>
    <div class="container">
        <h1>${params.extensionName}</h1>
        <p>Welcome to your browser extension!</p>
        <button id="actionBtn">Click Me</button>
        <div id="status"></div>
    </div>
    <script src="popup.js"></script>
</body>
</html>`;

    const htmlPath = path.join(popupDir, 'popup.html');
    await fs.writeFile(htmlPath, htmlContent);
    filesCreated.push(htmlPath);
    this.incrementFilesModified();

    // CSS
    const cssContent = `body {
    width: 300px;
    padding: 0;
    margin: 0;
    font-family: Arial, sans-serif;
}

.container {
    padding: 20px;
}

h1 {
    font-size: 18px;
    margin: 0 0 10px 0;
    color: #333;
}

p {
    margin: 10px 0;
    color: #666;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

button:hover {
    background-color: #45a049;
}

#status {
    margin-top: 10px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 4px;
    min-height: 20px;
}`;

    const cssPath = path.join(popupDir, 'popup.css');
    await fs.writeFile(cssPath, cssContent);
    filesCreated.push(cssPath);
    this.incrementFilesModified();

    // JavaScript
    const jsContent = `// Popup script
document.addEventListener('DOMContentLoaded', function() {
    const actionBtn = document.getElementById('actionBtn');
    const status = document.getElementById('status');

    actionBtn.addEventListener('click', async function() {
        status.textContent = 'Action triggered!';
        
        // Send message to background script
        try {
            const response = await chrome.runtime.sendMessage({ action: 'buttonClicked' });
            console.log('Response from background:', response);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    // Load saved data
    chrome.storage.sync.get(['lastAction'], function(result) {
        if (result.lastAction) {
            status.textContent = 'Last action: ' + result.lastAction;
        }
    });
});`;

    const jsPath = path.join(popupDir, 'popup.js');
    await fs.writeFile(jsPath, jsContent);
    filesCreated.push(jsPath);
    this.incrementFilesModified();
  }

  /**
   * Generate background service worker
   */
  private async generateBackgroundWorker(
    params: BrowserExtensionParams,
    extensionPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const backgroundDir = path.join(extensionPath, 'background');
    await fs.mkdir(backgroundDir, { recursive: true });

    const content = `// Background service worker (Manifest V3)

// Listen for installation
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('Extension installed:', details);
    
    // Initialize storage
    chrome.storage.sync.set({
        lastAction: 'Extension installed',
        installDate: new Date().toISOString()
    });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Message received:', request);
    
    if (request.action === 'buttonClicked') {
        // Handle button click
        chrome.storage.sync.set({ lastAction: 'Button clicked' });
        sendResponse({ status: 'success', message: 'Action processed' });
    }
    
    return true; // Keep message channel open for async response
});

// Listen for browser action clicks
chrome.action.onClicked.addListener(function(tab) {
    console.log('Extension icon clicked on tab:', tab.id);
});

// Example: Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        console.log('Tab loaded:', tab.url);
    }
});`;

    const backgroundPath = path.join(backgroundDir, 'background.js');
    await fs.writeFile(backgroundPath, content);
    filesCreated.push(backgroundPath);
    this.incrementFilesModified();
  }

  /**
   * Generate content script
   */
  private async generateContentScript(
    params: BrowserExtensionParams,
    extensionPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const contentDir = path.join(extensionPath, 'content');
    await fs.mkdir(contentDir, { recursive: true });

    const content = `// Content script - runs in the context of web pages

console.log('${params.extensionName} content script loaded');

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Content script received message:', request);
    
    if (request.action === 'analyzeDOM') {
        const analysis = {
            title: document.title,
            url: window.location.href,
            links: document.links.length,
            images: document.images.length
        };
        sendResponse(analysis);
    }
    
    return true;
});

// Example: Inject custom functionality
function init() {
    // Your custom page modifications here
    console.log('Content script initialized on:', window.location.href);
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}`;

    const contentPath = path.join(contentDir, 'content.js');
    await fs.writeFile(contentPath, content);
    filesCreated.push(contentPath);
    this.incrementFilesModified();
  }

  /**
   * Generate options page
   */
  private async generateOptionsPage(
    params: BrowserExtensionParams,
    extensionPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const optionsDir = path.join(extensionPath, 'options');
    await fs.mkdir(optionsDir, { recursive: true });

    // HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${params.extensionName} Options</title>
    <link rel="stylesheet" href="options.css">
</head>
<body>
    <div class="container">
        <h1>${params.extensionName} Settings</h1>
        <form id="optionsForm">
            <div class="form-group">
                <label for="setting1">Example Setting:</label>
                <input type="text" id="setting1" name="setting1">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="enableFeature" name="enableFeature">
                    Enable Feature
                </label>
            </div>
            <button type="submit">Save Settings</button>
        </form>
        <div id="status"></div>
    </div>
    <script src="options.js"></script>
</body>
</html>`;

    const htmlPath = path.join(optionsDir, 'options.html');
    await fs.writeFile(htmlPath, htmlContent);
    filesCreated.push(htmlPath);
    this.incrementFilesModified();

    // CSS
    const cssContent = `body {
    font-family: Arial, sans-serif;
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
}

h1 {
    color: #333;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    color: #666;
}

input[type="text"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}

#status {
    margin-top: 15px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 4px;
    display: none;
}`;

    const cssPath = path.join(optionsDir, 'options.css');
    await fs.writeFile(cssPath, cssContent);
    filesCreated.push(cssPath);
    this.incrementFilesModified();

    // JavaScript
    const jsContent = `// Options page script

// Load saved options
function loadOptions() {
    chrome.storage.sync.get(['setting1', 'enableFeature'], function(result) {
        document.getElementById('setting1').value = result.setting1 || '';
        document.getElementById('enableFeature').checked = result.enableFeature || false;
    });
}

// Save options
function saveOptions(e) {
    e.preventDefault();
    
    const setting1 = document.getElementById('setting1').value;
    const enableFeature = document.getElementById('enableFeature').checked;
    
    chrome.storage.sync.set({
        setting1: setting1,
        enableFeature: enableFeature
    }, function() {
        // Show status
        const status = document.getElementById('status');
        status.textContent = 'Settings saved!';
        status.style.display = 'block';
        
        setTimeout(function() {
            status.style.display = 'none';
        }, 2000);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('optionsForm').addEventListener('submit', saveOptions);`;

    const jsPath = path.join(optionsDir, 'options.js');
    await fs.writeFile(jsPath, jsContent);
    filesCreated.push(jsPath);
    this.incrementFilesModified();
  }

  /**
   * Generate icons info
   */
  private async generateIconsInfo(
    params: BrowserExtensionParams,
    extensionPath: string,
    filesCreated: string[]
  ): Promise<void> {
    const iconsDir = path.join(extensionPath, 'icons');
    await fs.mkdir(iconsDir, { recursive: true });

    const readmeContent = `# Extension Icons

Place your extension icons here:

- icon16.png (16x16px) - Toolbar icon
- icon48.png (48x48px) - Extensions management page
- icon128.png (128x128px) - Chrome Web Store

You can generate icons using tools like:
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/

Or create them using design software like:
- Adobe Illustrator
- Figma
- Sketch
`;

    const readmePath = path.join(iconsDir, 'README.md');
    await fs.writeFile(readmePath, readmeContent);
    filesCreated.push(readmePath);
    this.incrementFilesModified();
  }
}
