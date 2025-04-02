import { Module } from '@nestjs/common';
import {
  ConfigService,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import * as Joi from 'joi';
/**
 * This module imports the ConfigModule from NestJS with the forRoot() method.
 * This method configures the ConfigModule to load the configuration from the
 * environment variables and the .env file.
 * The configuration is then available for injection in the application.
 */
@Module({
  // Import the ConfigModule from NestJS with the forRoot() method
  imports: [
    NestConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_RETRY_ATTEMPTS: Joi.number().required(),
        REDIS_RETRY_DELAY: Joi.number().required(),
        PROJECTION_WORKFLOW_START_SYNC_DELAY: Joi.number().required(),
        AWS_REGION: Joi.string().required(),
        AWS_JOB1_TOPIC_ARN: Joi.string().required(),
        AWS_JOB2_TOPIC_ARN: Joi.string().required(),
        AWS_JOB3_TOPIC_ARN: Joi.string().required(),
        AWS_JOB1_QUEUE_URL: Joi.string().required(),
        AWS_JOB2_QUEUE_URL: Joi.string().required(),
        AWS_JOB3_QUEUE_URL: Joi.string().required(),
      }),
    }),
  ],

  // Provide the ConfigService so that it can be injected into other modules
  providers: [ConfigService],

  // Export the ConfigService so that it can be injected into other modules
  exports: [ConfigService],
})
export class ConfigModule {}
