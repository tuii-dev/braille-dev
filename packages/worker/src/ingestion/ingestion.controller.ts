import { Controller, Get } from '@nestjs/common';

import { IngestionService } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Get('ingest')
  async ingest() {
    // return this.ingestionService.handleIngestionSpawnerTask();
  }
}
