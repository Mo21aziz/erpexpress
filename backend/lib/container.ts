// lib/container.ts
import { PrismaClient } from "@prisma/client";
import { UserService } from "./users-management/services/user.service";
import { UserRepository } from "./users-management/repositories/user.repository";
import { RoleRepository } from "./users-management/repositories/role.repository";
import { RoleService } from "./users-management/services/role.service";
import { AuthService } from "./auth/services/auth.service";
import { CategoryService } from "./categories-managements/services/category.service";
import { CategoryRepository } from "./categories-managements/repositories/category.repository";
import { ArticleRepository } from "./categories-managements/repositories/article.repository";
import { ArticleService } from "./categories-managements/services/article.service";
import { BonDeCommandeService } from "./bon-de-commande/services/bon-de-commande.service";
import { BonDeCommandeRepository } from "./bon-de-commande/repositories/bon-de-commande.repository";

const prisma = new PrismaClient();

// user-management + auth
const userService = new UserService(new UserRepository(prisma), prisma);
const authService = new AuthService(userService);
const roleService = new RoleService(new RoleRepository(prisma));

// categories management
const categoryRepository = new CategoryRepository(prisma);
const categoryService = new CategoryService(categoryRepository, prisma);
//article management
const articleRepository = new ArticleRepository(prisma);
const articleService = new ArticleService(articleRepository, prisma);

//bon de commande management
const bonDeCommandeRepository = new BonDeCommandeRepository(prisma);
const bonDeCommandeService = new BonDeCommandeService(
  bonDeCommandeRepository,
  prisma
);

const container = {
  // Existing services
  AuthService: authService,
  UserService: userService,
  RoleService: roleService,
  CategoryService: categoryService,
  ArticleService: articleService,
  BonDeCommandeService: bonDeCommandeService,

  // Prisma client
  prisma,
};

export default container;
