import { Controller, Query, Get } from '@nestjs/common';

import { OpenAIService } from './openai.service';

@Controller('openai')
export class OpenAIController {
  constructor(private readonly openaiService: OpenAIService) {}

  @Get('image')
  async createImage(@Query('prompt') prompt: string) {
    return await this.openaiService.createImage(prompt);
  }
}
