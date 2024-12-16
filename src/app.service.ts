import { Injectable } from '@nestjs/common';
import { I18nLang, I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {

  constructor(private readonly i18n : I18nService){}
  async getHello(@I18nLang() lang: string): Promise<string> {
    const message = await this.i18n.translate('common.HELLO' , {
      lang
    });

    return message;
  }
}
