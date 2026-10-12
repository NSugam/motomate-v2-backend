import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { env } from 'src/config/env';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    if (!env.REDIS_URL) {
      throw new Error('REDIS_URL is required.');
    }

    this.client = new Redis(env.REDIS_URL, { lazyConnect: true });
    this.client.on('error', (error: Error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });
  }

  async onModuleInit() {
    await this.client.connect();
    await this.client.ping();
    console.log('Redis connected');
  }

  async onModuleDestroy() {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }

  getClient() {
    return this.client;
  }

  async set(key: string, value: unknown, ttl?: number) {
    const serializedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (serializedValue === undefined) {
      throw new TypeError('Redis values must be strings or JSON-serializable.');
    }

    if (ttl !== undefined) {
      return this.client.set(key, serializedValue, 'EX', ttl * 60);
    }

    return this.client.set(key, serializedValue);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async delete(key: string) {
    return this.client.del(key);
  }

  async exists(key: string) {
    return this.client.exists(key);
  }
}
