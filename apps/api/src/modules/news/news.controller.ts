// news.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NewsService } from './news.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get()
  getNews(@Query('filter') filter?: string, @Query('coins') coins?: string) {
    return this.newsService.getNews(filter, coins);
  }

  @Get('fear-greed')
  getFearGreed() {
    return this.newsService.getFearGreed();
  }
}
