import { Module } from '@nestjs/common';

import { ApplicationsModule } from '../applications/applications.module';
import { OpenAIModule } from '../openai/openai.module';
import { VectorindexModule } from '../vectorindex/vectorindex.module';

import { DataExtractionService } from './data-extraction.service';

@Module({
  imports: [OpenAIModule, VectorindexModule, ApplicationsModule],
  providers: [DataExtractionService],
  controllers: [],
  exports: [DataExtractionService],
})
export class DataExtractionModule {}
