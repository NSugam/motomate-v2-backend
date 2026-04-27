import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';

@Controller('health-check')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  // Healthcheck Only Endpoint
  @Get()
  @SkipThrottle()
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  // DB Check Endpoint
  @Get('db')
  async dbCheck() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        db: 'ok',
        message: 'Database Connected',
      };
    } catch {
      return {
        db: 'down',
        message: 'Database connection failed',
      };
    }
  }
}
