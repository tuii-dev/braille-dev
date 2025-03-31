import { Injectable } from '@nestjs/common';

// enum OpenAIModels {
//   GPT_3_5_TURBO = 'gpt-3.5-turbo',
//   GPT_4_VISION_PREVIEW = 'gpt-4-vision-preview',
// }

@Injectable()
export class RatelimiterService {
  // async waitForOpenAiLimits() {
  //   return new Promise<void>((res) => {
  //     setTimeout(() => {
  //       res();
  //     }, 1000);
  //   });
  // }
}
