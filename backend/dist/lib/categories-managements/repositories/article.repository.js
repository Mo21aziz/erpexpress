"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleRepository = void 0;
class ArticleRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getCategoryInclude(options) {
        return options?.includeCategory
            ? {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            }
            : {};
    }
    async create(data, options) {
        return this.prisma.article.create({
            data,
            include: this.getCategoryInclude(options),
        });
    }
    async findById(id, options) {
        return this.prisma.article.findUnique({
            where: { id },
            include: this.getCategoryInclude(options),
        });
    }
    async update(id, data, options) {
        return this.prisma.article.update({
            where: { id },
            data,
            include: this.getCategoryInclude(options),
        });
    }
    async delete(id, options) {
        return this.prisma.article.delete({
            where: { id },
            include: this.getCategoryInclude(options),
        });
    }
    async findByCommandeCategory(categoryId, options) {
        return this.prisma.article.findFirst({
            where: { category_id: categoryId },
            include: this.getCategoryInclude(options),
            orderBy: { numero: "asc" },
        });
    }
    async findByCondition(queryObject = {}, options) {
        return this.prisma.article.findMany({
            where: queryObject.where || {},
            include: this.getCategoryInclude(options),
            orderBy: queryObject.orderBy || { numero: "asc" },
        });
    }
}
exports.ArticleRepository = ArticleRepository;
