import { AgentCommand, AgentResponse } from '../../types';
import { BrowserManager } from '../browser';
import { logger } from '../../utils/logger';

export abstract class BaseCommand {
  protected browserManager: BrowserManager;

  constructor(browserManager: BrowserManager) {
    this.browserManager = browserManager;
  }

  abstract execute(command: AgentCommand): Promise<AgentResponse>;
}
