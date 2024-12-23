import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { I18nService } from 'nestjs-i18n';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async list() {
    return await this.categoryService.list();
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return await this.categoryService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return await this.categoryService.update(+id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.categoryService.delete(+id);
    const message = await this.i18n.translate('test.CATEGORY_DELETED');
    return {
      message: message,
    };
  }
}
