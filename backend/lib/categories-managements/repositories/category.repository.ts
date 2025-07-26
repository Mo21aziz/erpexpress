import { PrismaClient } from "@prisma/client";
import { BaseRepository } from "../../../prisma/repositories/prisma-abstract-repository";
import { Category } from "../../../types/category";

export class CategoryRepository extends BaseRepository<Category> {
  constructor(prisma: PrismaClient) {
    super(prisma.category, prisma);
  }
}