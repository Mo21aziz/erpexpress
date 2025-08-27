import { Decimal } from "@prisma/client/runtime/library";

export interface Article {
  id: string;
  name: string;
  description?: string;
  price: Decimal | number | null;
  collisage: string;
  type: string; // "catering" or "sonodis"
  numero?: number;
  quantite_a_stocker: number;
  quantite_a_demander: number;
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
}

export type CreateArticleInput = {
  name: string;
  description?: string;
  price: number | Decimal;
  collisage: string;
  type: string; // "catering" or "sonodis"
  numero?: number;
  quantite_a_stocker: number;
  quantite_a_demander: number;
  category_id: string;
};

export type UpdateArticleInput = Partial<CreateArticleInput>;

export interface ArticleRepositoryOptions {
  includeCategory?: boolean;
}
