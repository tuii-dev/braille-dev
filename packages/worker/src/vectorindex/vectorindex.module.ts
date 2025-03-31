import { Module } from '@nestjs/common';

import { OpenAIModule } from '../openai/openai.module';
import { VectorindexService } from './vectorindex.service';
import { VectorindexController } from './vectorindex.controller';

@Module({
  imports: [OpenAIModule],
  providers: [VectorindexService],
  controllers: [VectorindexController],
  exports: [VectorindexService],
})
export class VectorindexModule {}
