import { AgentCommand, AgentResponse } from '../../types';
import { BaseCommand } from './base';
import { logger } from '../../utils/logger';

export class ScreenshotCommand extends BaseCommand {
  async execute(command: AgentCommand): Promise<AgentResponse> {
    try {
      const { path, fullPage = false } = command.payload || {};

      const pages = await this.browserManager.getPages();
      if (pages.length === 0) {
        return {
          success: false,
          error: 'No active page',
          commandId: command.id,
        };
      }

      const screenshot = await pages[0].screenshot({
        path,
        fullPage,
        encoding: 'base64',
      });

      logger.info(`Screenshot taken${path ? ` and saved to ${path}` : ''}`);

      return {
        success: true,
        data: {
          screenshot: path ? path : screenshot,
        },
        commandId: command.id,
      };
    } catch (error: any) {
      logger.error('Screenshot command failed:', error);
      return {
        success: false,
        error: error.message,
        commandId: command.id,
      };
    }
  }
}
