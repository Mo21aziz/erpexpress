import { PrismaClient, Prisma } from "@prisma/client";
import { Article, ArticleRepositoryOptions } from "../../../types/article";

export class ArticleRepository {
  constructor(private prisma: PrismaClient) {}

  private getCategoryInclude(options?: ArticleRepositoryOptions) {
    return options?.includeCategory ? {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    } : {};
  }

  async create(
    data: Prisma.ArticleUncheckedCreateInput,
    options?: ArticleRepositoryOptions
  ): Promise<Article> {
    return this.prisma.article.create({
      data,
      include: this.getCategoryInclude(options)
    });
  }

  async findById(
    id: string,
    options?: ArticleRepositoryOptions
  ): Promise<Article | null> {
    return this.prisma.article.findUnique({
      where: { id },
      include: this.getCategoryInclude(options)
    });
  }

  async update(
    id: string,
    data: Prisma.ArticleUpdateInput,
    options?: ArticleRepositoryOptions
  ): Promise<Article> {
    return this.prisma.article.update({
      where: { id },
      data,
      include: this.getCategoryInclude(options)
    });
  }

  async delete(
    id: string,
    options?: ArticleRepositoryOptions
  ): Promise<Article> {
    return this.prisma.article.delete({
      where: { id },
      include: this.getCategoryInclude(options)
    });
  }

  async findByCommandeCategory(
    categoryId: string,
    options?: ArticleRepositoryOptions
  ): Promise<Article | null> {
    return this.prisma.article.findFirst({
      where: { category_id: categoryId },
      include: this.getCategoryInclude(options)
    });
  }

  async findByCondition(
    queryObject: any = {},
    options?: ArticleRepositoryOptions
  ): Promise<Article[]> {
    return this.prisma.article.findMany({
      where: queryObject.where || {},
      include: this.getCategoryInclude(options)
    });
  }
}