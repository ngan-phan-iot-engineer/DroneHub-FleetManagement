import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FlightsController],
  providers: [FlightsService],
  exports: [FlightsService],
})
export class FlightsModule {}
