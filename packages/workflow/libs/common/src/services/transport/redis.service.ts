import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor(
    private readonly configService: ConfigService,
    @InjectPinoLogger(RedisService.name)
    private readonly logger: PinoLogger,
  ) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
    });
  }

  async getValue(key: string) {
    const val = await this.redisClient.get(key);
    this.logger.info(`Getting value ${val} for key: ${key}`);
    return val;
  }

  async delete(key: string) {
    this.logger.info(`Deleting key: ${key}`);
    await this.redisClient.del(key);
  }

  async exists(key: string) {
    this.logger.info(`Checking if key ${key} exists`);
    return this.redisClient.exists(key);
  }

  async setValue(key: string, value: string) {
    this.logger.info(`Setting value ${value} for key: ${key}`);
    await this.redisClient.set(key, value);
  }

  async setValueWithTTL(key: string, value: string, ttl: number) {
    this.logger.info(`Setting value ${value} with TTL ${ttl} for key: ${key}`);
    await this.redisClient.set(key, value, 'EX', ttl);
  }

  async lpush(key: string, value: string) {
    this.logger.info(`Adding value ${value} to list key: ${key}`);
    await this.redisClient.lpush(key, value);
  }

  async ltrim(key: string, start: number, stop: number) {
    this.logger.info(`Trimming list key: ${key} from ${start} to ${stop}`);
    await this.redisClient.ltrim(key, start, stop);
  }

  async lrange(key: string, start: number, stop: number) {
    this.logger.info(
      `Getting range from list key: ${key} from ${start} to ${stop}`,
    );
    return this.redisClient.lrange(key, start, stop);
  }

  async zadd(key: string, score: number, member: string) {
    this.logger.info(
      `Adding value ${member} with score ${score} to sorted set key: ${key}`,
    );
    await this.redisClient.zadd(key, score, member);
  }

  async zremrangebyscore(key: string, min: number, max: number) {
    this.logger.info(
      `Removing values from sorted set key: ${key} with scores between ${min} and ${max}`,
    );
    await this.redisClient.zremrangebyscore(key, min, max);
  }

  async zcount(key: string, min: number, max: number): Promise<number> {
    this.logger.info(
      `Counting values in sorted set key: ${key} with scores between ${min} and ${max}`,
    );
    return this.redisClient.zcount(key, min, max);
  }

  async close() {
    this.logger.info('Closing Redis connection');
    await this.redisClient.quit();
  }
}
