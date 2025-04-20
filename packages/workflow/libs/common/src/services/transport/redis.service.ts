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

  async close() {
    this.logger.info('Closing Redis connection');
    await this.redisClient.quit();
  }
}
