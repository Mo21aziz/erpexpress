import { Decimal } from "@prisma/client/runtime/library";

export interface Article {
  id: string;
  name: string;
  description: string;
  price: Decimal | number | null;
  collisage: string;
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
}

export type CreateArticleInput = {
  name: string;
  description: string;
  price: number | Decimal;
  collisage: string;
  category_id: string;
};

export type UpdateArticleInput = Partial<CreateArticleInput>;

export interface ArticleRepositoryOptions {
  includeCategory?: boolean;
}