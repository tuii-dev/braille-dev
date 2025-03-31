import { createLogger, format, transports, type Logger } from 'winston';
import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class BrailleLogger implements LoggerService {
  public logger: Logger;

  constructor(name: string) {
    this.logger = createLogger({
      format: format.json(),
      defaultMeta: { service: `braille-worker:${name}` },
      transports: [new transports.Console()],
    });
  }
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams);
  }

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message, ...optionalParams);
  }
}
