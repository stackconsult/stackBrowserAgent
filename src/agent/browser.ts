import puppeteer, { Browser, Page } from 'puppeteer';
import { BrowserConfig } from '../types';
import { logger } from '../utils/logger';
import { ExtensionLoader } from '../extensions/loader';

export class BrowserManager {
  private browser: Browser | null = null;
  private config: BrowserConfig;
  private extensionLoader: ExtensionLoader;

  constructor(config: BrowserConfig) {
    this.config = config;
    this.extensionLoader = new ExtensionLoader(config.extensionsPath);
  }

  /**
   * Launch the browser with extensions
   */
  async launch(): Promise<Browser> {
    try {
      const extensionPaths = await this.extensionLoader.getExtensionPaths();
      
      const launchOptions: any = {
        headless: this.config.headless,
        devtools: this.config.devtools,
        args: [
          ...(this.config.args || []),
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      };

      // Add extensions if any are found
      if (extensionPaths.length > 0) {
        launchOptions.args.push(
          `--disable-extensions-except=${extensionPaths.join(',')}`,
          `--load-extension=${extensionPaths.join(',')}`
        );
        launchOptions.headless = false; // Extensions require headed mode
        logger.info(`Loading ${extensionPaths.length} extension(s)`);
      }

      if (this.config.userDataDir) {
        launchOptions.userDataDir = this.config.userDataDir;
      }

      this.browser = await puppeteer.launch(launchOptions);
      logger.info('Browser launched successfully');

      // Log browser version
      const version = await this.browser.version();
      logger.info(`Browser version: ${version}`);

      return this.browser;
    } catch (error) {
      logger.error('Failed to launch browser:', error);
      throw error;
    }
  }

  /**
   * Create a new page
   */
  async newPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not launched');
    }

    const page = await this.browser.newPage();

    if (this.config.viewport) {
      await page.setViewport(this.config.viewport);
    }

    return page;
  }

  /**
   * Get all pages
   */
  async getPages(): Promise<Page[]> {
    if (!this.browser) {
      throw new Error('Browser not launched');
    }

    return await this.browser.pages();
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }

  /**
   * Get browser instance
   */
  getBrowser(): Browser | null {
    return this.browser;
  }

  /**
   * Check if browser is running
   */
  isRunning(): boolean {
    return this.browser !== null && this.browser.process() !== null;
  }

  /**
   * Get loaded extensions
   */
  getLoadedExtensions() {
    return this.extensionLoader.getLoadedExtensions();
  }
}
