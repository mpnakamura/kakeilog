export interface CreateIncomeInput {
  title: string;
  amount: number;
  date: string;
  categoryId: string;
  subCategoryId?: string;
  memo?: string;
}
