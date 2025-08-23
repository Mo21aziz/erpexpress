import { Article } from "@prisma/client";

export interface Category {
  id: string;
  name: string;
  description?: string;
  commande_categories?: CommandeCategory[]; // Optional relation
}


export interface CommandeCategory {
  id: string;
  bon_de_commande_id: string;
  category_id: string;
  article?: Article;
}