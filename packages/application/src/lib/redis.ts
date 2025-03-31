import Redis from "ioredis";

let singleton: Redis | null = null;

export const redis = () => {
  if (!singleton) {
    singleton = new Redis({
      host: process.env.REDIS_HOST,
      reconnectOnError: (error) => {
        const targetErrors = [/READONLY/, /ETIMEDOUT/];
        return targetErrors.some((targetError) =>
          targetError.test(error.message),
        );
      },
      connectTimeout: 17000,
      maxRetriesPerRequest: 4,
      retryStrategy: (times) => Math.min(times * 30, 1000),
    });
  }

  return singleton;
};
