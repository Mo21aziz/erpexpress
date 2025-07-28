import { ArticleRepository } from "../repositories/article.repository";
import { PrismaClient } from "@prisma/client";
import { Article, CreateArticleInput } from "../../../types/article";

export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    private prisma: PrismaClient
  ) {}

  async createArticle(data: CreateArticleInput): Promise<Article> {
    if (!data.collisage) {
      throw new Error("Collisage is required");
    }
    if (data.price && Number(data.price) <= 0) {
      throw new Error("Price must be positive");
    }
    
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: data.category_id }
    });
    if (!categoryExists) {
      throw new Error("Category not found");
    }

    return await this.articleRepository.create(data, { includeCategory: true });
  }

  async getArticleById(id: string): Promise<Article | null> {
    return await this.articleRepository.findById(id, { includeCategory: true });
  }

  async updateArticle(
    id: string,
    data: Partial<CreateArticleInput>
  ): Promise<Article> {
    if (data.price && Number(data.price) <= 0) {
      throw new Error("Price must be positive");
    }
    return await this.articleRepository.update(id, data, { includeCategory: true });
  }

  async deleteArticle(id: string): Promise<Article> {
    return await this.articleRepository.delete(id, { includeCategory: true });
  }

  async getArticleByCommandeCategory(categoryId: string): Promise<Article | null> {
    return await this.articleRepository.findByCommandeCategory(categoryId, { includeCategory: true });
  }

  async getAllArticles(queryObject: any = {}): Promise<Article[]> {
    return await this.articleRepository.findByCondition(queryObject, { includeCategory: true });
  }
}