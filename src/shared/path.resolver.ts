import { Injectable } from '@nestjs/common';
import { I18nResolver } from 'nestjs-i18n';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class PathResolver implements I18nResolver {
  constructor(
    private readonly options: { pathKey: string } = { pathKey: 'lang' },
  ) {}

  resolve(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const lang = request.params[this.options.pathKey];
    return lang;
  }
}
