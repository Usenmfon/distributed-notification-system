import { Module } from '@nestjs/common';
import { HealthCheckController } from './health_check.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [HealthCheckController],
  imports: [TerminusModule, HttpModule],
})
export class HealthCheckModule {}
