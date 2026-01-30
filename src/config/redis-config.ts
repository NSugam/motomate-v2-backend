import redisStore from 'cache-manager-ioredis';

interface RedisConfig {
  store: typeof redisStore;
  host: string;
  port: number;
  ttl: number;
}

export const redisConfig: RedisConfig = {
  store: redisStore,
  host: 'localhost',
  port: 6379,
  ttl: 60,
};
