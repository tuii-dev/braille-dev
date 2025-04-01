import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class MessageDeduplicationService {
  constructor(private readonly redisService: RedisService) {}

  async isMessageDuplicate(messageId: string): Promise<boolean> {
    const exists = await this.redisService.exists(messageId);
    return exists > 0;
  }

  async markMessageAsProcessed(messageId: string, ttl: number): Promise<void> {
    await this.redisService.setValueWithTTL(messageId, 'processed', ttl);
  }
}
