import { CategoriesService } from './categories.service';
import { Controller, Get } from '@nestjs/common';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories() {
    return await this.categoriesService.getAllCategories();
  }
}
