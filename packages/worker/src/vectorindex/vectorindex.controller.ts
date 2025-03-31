import { Controller, Query, Get, ParseIntPipe } from '@nestjs/common';

import { VectorindexService } from './vectorindex.service';

@Controller('search')
export class VectorindexController {
  constructor(private readonly vectorindexService: VectorindexService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('entityModelId') entityModelId: string,
    @Query('tenantId') tenantId: string,
    @Query('take', ParseIntPipe) take = 5,
  ) {
    const searchResults = await this.vectorindexService.search(
      query,
      entityModelId,
      tenantId,
      take,
    );

    return searchResults;
  }
}
