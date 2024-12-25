import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { I18n, I18nContext, I18nLang } from 'nestjs-i18n';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@I18n() i18n: I18nContext) {
    return this.appService.getHello();
  }
}
