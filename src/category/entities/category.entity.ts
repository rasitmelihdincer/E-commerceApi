export class CategoryEntity {
  id: number;
  name: string;
  parentId?: number;
  totalProducts?: number;
  parent: CategoryEntity | null;
  children: CategoryEntity;
}
