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
        REDIS_HOST: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
      }),
    }),
  ],

  // Provide the ConfigService so that it can be injected into other modules
  providers: [ConfigService],

  // Export the ConfigService so that it can be injected into other modules
  exports: [ConfigService],
})
export class ConfigModule {}
