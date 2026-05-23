import { Controller, Get } from '@nestjs/common';
import { PrometheusService } from '@common/monitoring/prometheus.service';

@Controller('metrics')
export class MetricsController {
  constructor(private prometheusService: PrometheusService) {}

  @Get()
  async getMetrics(): Promise<string> {
    return this.prometheusService.getMetrics();
  }
}
