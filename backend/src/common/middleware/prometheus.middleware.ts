import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrometheusService } from '../monitoring/prometheus.service';

@Injectable()
export class PrometheusMiddleware implements NestMiddleware {
  constructor(private prometheusService: PrometheusService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const route = req.route?.path || req.path;
      const method = req.method;
      const statusCode = res.statusCode;

      this.prometheusService.recordHttpRequest(method, route, statusCode, duration);
    });

    next();
  }
}
