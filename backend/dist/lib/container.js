"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// lib/container.ts
const client_1 = require("@prisma/client");
const user_service_1 = require("./users-management/services/user.service");
const user_repository_1 = require("./users-management/repositories/user.repository");
const role_repository_1 = require("./users-management/repositories/role.repository");
const role_service_1 = require("./users-management/services/role.service");
const auth_service_1 = require("./auth/services/auth.service");
const category_service_1 = require("./categories-managements/services/category.service");
const category_repository_1 = require("./categories-managements/repositories/category.repository");
const article_repository_1 = require("./categories-managements/repositories/article.repository");
const article_service_1 = require("./categories-managements/services/article.service");
const bon_de_commande_service_1 = require("./bon-de-commande/services/bon-de-commande.service");
const bon_de_commande_repository_1 = require("./bon-de-commande/repositories/bon-de-commande.repository");
const prisma = new client_1.PrismaClient();
// user-management + auth
const userService = new user_service_1.UserService(new user_repository_1.UserRepository(prisma), prisma);
const authService = new auth_service_1.AuthService(userService);
const roleService = new role_service_1.RoleService(new role_repository_1.RoleRepository(prisma));
// categories management
const categoryRepository = new category_repository_1.CategoryRepository(prisma);
const categoryService = new category_service_1.CategoryService(categoryRepository, prisma);
//article management
const articleRepository = new article_repository_1.ArticleRepository(prisma);
const articleService = new article_service_1.ArticleService(articleRepository, prisma);
//bon de commande management
const bonDeCommandeRepository = new bon_de_commande_repository_1.BonDeCommandeRepository(prisma);
const bonDeCommandeService = new bon_de_commande_service_1.BonDeCommandeService(bonDeCommandeRepository, prisma);
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
exports.default = container;
