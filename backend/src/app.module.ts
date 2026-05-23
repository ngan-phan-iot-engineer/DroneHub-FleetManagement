import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { PrismaModule } from '@common/prisma/prisma.module';
import { LoggerModule } from '@common/logger/logger.module';
import { MonitoringModule } from '@common/monitoring/monitoring.module';
import { PrometheusMiddleware } from '@common/middleware/prometheus.middleware';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { FlightsModule } from '@modules/flights/flights.module';
import { LogsModule } from '@modules/logs/logs.module';
import { TeamsModule } from '@modules/teams/teams.module';
import { HealthModule } from '@modules/health/health.module';
import { EventsModule } from '@modules/events/events.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore as any,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      ttl: parseInt(process.env.CACHE_TTL || '300'),
    }),
    PrismaModule,
    LoggerModule,
    MonitoringModule,
    AuthModule,
    UsersModule,
    FlightsModule,
    LogsModule,
    TeamsModule,
    HealthModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PrometheusMiddleware).forRoutes('*');
  }
}
