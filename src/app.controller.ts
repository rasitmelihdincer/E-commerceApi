import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { I18nLang } from 'nestjs-i18n';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@I18nLang() lang: string): Promise<string> {  {
    return this.appService.getHello(lang);
  }
}
}
