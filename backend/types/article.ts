import { Decimal } from "@prisma/client/runtime/library";

export interface Article {
  id: string;
  name: string;
  description?: string | null; // Allow null to match Prisma schema
  price?: Decimal | number | null; // Allow null to match Prisma schema
  collisage: string;
  type: string; // "catering" or "sonodis"
  numero?: number | null; // Allow null to match Prisma schema
  quantite_a_stocker?: Decimal | number | null; // Allow null to match Prisma schema
  quantite_a_demander?: Decimal | number | null; // Allow null to match Prisma schema
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
}

export type CreateArticleInput = {
  name: string;
  description?: string | null;
  price?: number | Decimal | null;
  collisage: string;
  type: string; // "catering" or "sonodis"
  numero?: number | null;
  quantite_a_stocker?: number | Decimal | null;
  quantite_a_demander?: number | Decimal | null;
  category_id: string;
};

export type UpdateArticleInput = Partial<CreateArticleInput>;

export interface ArticleRepositoryOptions {
  includeCategory?: boolean;
}
