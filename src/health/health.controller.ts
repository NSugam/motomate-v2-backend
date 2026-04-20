import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';

@SkipThrottle()
@Controller('health-check')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get()
  async check() {
    let dbStatus = 'unknown';
    try {
      await this.dataSource.query('SELECT 1');
      dbStatus = 'ok';
    } catch {
      dbStatus = 'down';
    }

    const uptime = process.uptime();
    return {
      data: {
        DBConnection:
          dbStatus === 'ok'
            ? 'Database Connected'
            : 'Database connection failed',
        uptime,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
