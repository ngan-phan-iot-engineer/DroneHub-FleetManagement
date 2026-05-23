import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Injectable()
export class LoggerService extends NestLogger {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    super();
    const logFormat = this.configService.get<string>('LOG_FORMAT', 'json');
    const logLevel = this.configService.get<string>('LOG_LEVEL', 'debug');

    const transporters: winston.transport[] = [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          logFormat === 'json' ? winston.format.json() : winston.format.simple(),
        ),
      }),
    ];

    if (process.env.NODE_ENV !== 'production') {
      transporters.push(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      transports: transporters,
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
    super.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
    super.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
    super.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
    super.debug(message, context);
  }
}
