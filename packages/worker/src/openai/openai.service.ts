import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';

import OpenAI from 'openai';
import Redis from 'ioredis';

const RATE_LIMIT_HEADER_PREFIX = 'x-ratelimit';

const RATE_LIMIT_HEADERS = [
  'limit-requests',
  'limit-tokens',
  'remaining-requests',
  'remaining-tokens',
  'reset-requests',
  'reset-tokens',
] as const;

@Injectable()
export class OpenAIService {
  openai: OpenAI = new OpenAI();

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async waitForUsageLimits(model: string) {
    const limits = ['requests', 'tokens'] as const;

    const remainingLimits = await this.redis.mget(
      limits.map((limit) => `usage:openai:${model}:remaining-${limit}`),
    );

    const exceededLimits = remainingLimits.reduce((acc, cur, index) => {
      if (cur && Number(cur) <= 0) {
        return [...acc, limits[index]];
      }
      return acc;
    }, []);

    if (exceededLimits.length === 0) {
      return void 0;
    }

    console.log(`EXCEEDED LIMITS for ${model}:`, exceededLimits);

    const resets = (
      await this.redis.mget(
        exceededLimits.map((limit) => `limit:reset:openai:${model}:${limit}`),
      )
    ).map(Number);

    const maxReset = Math.max(...resets);

    if (maxReset <= Date.now()) {
      console.log('MAX RESET IS IN THE PAST, CONTINUING');
      return void 0;
    }

    return new Promise<void>((resolve) => {
      setTimeout(resolve, maxReset - Date.now());
    });
  }

  private rateLimitsFromHeaders(headers: Headers) {
    return (header: `${(typeof RATE_LIMIT_HEADERS)[number]}`) => {
      return headers.get(`${RATE_LIMIT_HEADER_PREFIX}-${header}`);
    };
  }

  private convertToUnixTimestamp(time: string) {
    const regex = /(?:^|(\d+)m)?(?:(\d+(?:\.\d+)?)s|$)?/;
    const match = time.match(regex);

    if (!match) {
      throw new Error("Invalid input format. Please use the format 'm:ss.s'");
    }

    const minutes = match[1] ? parseFloat(match[1]) : 0;
    const seconds = match[2] ? parseFloat(match[2]) : 0;
    const totalSeconds = minutes * 60 + seconds;
    const unixTimestamp = Math.ceil(Date.now() + totalSeconds * 1000);

    return unixTimestamp;
  }

  private async trackUsage(model: string, headers: Headers) {
    const getHeader = this.rateLimitsFromHeaders(headers);

    const usage = {
      limits: {
        requests: getHeader('limit-requests') ?? '',
        tokens: getHeader('limit-tokens') ?? '',
      },
      remaining: {
        requests: getHeader('remaining-requests') ?? '',
        tokens: getHeader('remaining-tokens') ?? '',
      },
      reset: {
        requests: getHeader('reset-requests') ?? '',
        tokens: getHeader('reset-tokens') ?? '',
      },
    };

    await this.redis.mset({
      /**
       * Limits
       */
      [`limits:openai:${model}:limit-requests`]: usage.limits.requests,
      [`limit:openai:${model}:limit-tokens`]: usage.limits.tokens,
      /**
       * Limit resets
       */
      [`limit:reset:openai:${model}:requests`]: this.convertToUnixTimestamp(
        usage.reset.requests,
      ),
      [`limit:reset:openai:${model}:tokens`]: this.convertToUnixTimestamp(
        usage.reset.tokens,
      ),
      /**
       * Usage remaining
       */
      [`usage:openai:${model}:remaining-requests`]: usage.remaining.requests,
      [`usage:openai:${model}:remaining-tokens`]: usage.remaining.tokens,
    });
  }

  async interpretImages(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    tool?: OpenAI.Chat.Completions.ChatCompletionTool,
  ) {
    const model = 'gpt-4o';
    const { data, response } = await this.openai.chat.completions
      .create({
        model,
        /**
         * THIS IS THE ABSOLUTE LIMIT OPENAI CAN HANDLE
         */
        max_tokens: 4096,
        messages,
        temperature: 0,
        ...(tool
          ? {
              tools: [tool],
              tool_choice: {
                type: 'function',
                function: { name: tool.function.name },
              },
            }
          : {}),
      })
      .withResponse();

    await this.trackUsage(model, response.headers);

    return data;
  }

  // async gpt({
  //   messages,
  //   model,
  //   tools,
  //   tool_choice,
  // }: Pick<
  //   Parameters<OpenAI.Chat.Completions['create']>[0],
  //   'messages' | 'tools' | 'tool_choice' | 'model'
  // >) {
  //   const { data, response } = await this.openai.chat.completions
  //     .create({
  //       model,
  //       messages,
  //       tools,
  //       tool_choice,
  //       temperature: 0,
  //     })
  //     .withResponse();

  //   await this.trackUsage(model, response.headers);

  //   return data;
  // }

  async createEmbeddings(input: string | string[]) {
    const model = 'text-embedding-ada-002';
    const { data, response } = await this.openai.embeddings
      .create({
        model,
        input,
        encoding_format: 'float',
      })
      .withResponse();

    await this.trackUsage(model, response.headers);

    return data;
  }

  async createImage(
    prompt: string,
    size: OpenAI.Images.ImageGenerateParams['size'] = '1024x1024',
  ) {
    return await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size,
      quality: 'standard',
    });
  }
}
