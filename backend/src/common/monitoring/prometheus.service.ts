import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as promClient from 'prom-client';

@Injectable()
export class PrometheusService {
  private httpRequestDuration!: promClient.Histogram<string>;
  private httpRequestTotal!: promClient.Counter<string>;
  private initialized = false;

  constructor(private configService: ConfigService) {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // Only initialize once
    if (this.initialized) return;
    this.initialized = true;

    // Default metrics - register only if not already registered
    try {
      promClient.collectDefaultMetrics({ register: promClient.register });
    } catch (error) {
      // Metrics already registered, ignore
    }

    // Custom metrics - check if already registered
    try {
      this.httpRequestDuration = new promClient.Histogram({
        name: 'http_request_duration_ms',
        help: 'Duration of HTTP requests in ms',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.1, 5, 15, 50, 100, 500],
        registers: [promClient.register],
      });

      this.httpRequestTotal = new promClient.Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
        registers: [promClient.register],
      });
    } catch (error) {
      // Metrics already exist, try to get them
      const metrics = promClient.register.getSingleMetric('http_request_duration_ms');
      if (metrics) {
        this.httpRequestDuration = metrics as promClient.Histogram<string>;
      }
      const total = promClient.register.getSingleMetric('http_requests_total');
      if (total) {
        this.httpRequestTotal = total as promClient.Counter<string>;
      }
    }
  }

  getMetrics() {
    return promClient.register.metrics();
  }

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.labels(method, route, statusCode.toString()).observe(duration);
    this.httpRequestTotal.labels(method, route, statusCode.toString()).inc();
  }
}
