export class ArticleService {
    articleRepository;
    prisma;
    constructor(articleRepository, prisma) {
        this.articleRepository = articleRepository;
        this.prisma = prisma;
    }
    async createArticle(data) {
        if (!data.collisage) {
            throw new Error("Collisage is required");
        }
        if (!data.type) {
            throw new Error("Article type is required");
        }
        if (data.type !== "catering" && data.type !== "sonodis") {
            throw new Error("Article type must be either 'catering' or 'sonodis'");
        }
        if (data.price && Number(data.price) <= 0) {
            throw new Error("Price must be positive");
        }
        // Validate numero if provided
        if (data.numero !== undefined && data.numero !== null) {
            const numeroValue = Number(data.numero);
            if (!Number.isInteger(numeroValue) || numeroValue < 0) {
                throw new Error("Numero must be a non-negative integer");
            }
        }
        const categoryExists = await this.prisma.category.findUnique({
            where: { id: data.category_id },
        });
        if (!categoryExists) {
            throw new Error("Category not found");
        }
        // If numero is provided, shift existing numeros >= numero, then create (atomic)
        if (data.numero !== undefined && data.numero !== null) {
            const newNumero = Number(data.numero);
            const created = await this.prisma.$transaction(async (tx) => {
                // Check if the target numero is occupied AFTER we shift
                // First, shift all articles with numero >= newNumero up by 1
                await tx.article.updateMany({
                    where: { numero: { gte: newNumero } },
                    data: { numero: { increment: 1 } },
                });
                // Now check if the numero we want to use is actually available
                // (it might have been occupied by an article that just got shifted)
                const stillOccupied = await tx.article.findFirst({
                    where: { numero: newNumero },
                });
                if (stillOccupied) {
                    throw new Error(`Numero ${newNumero} is not available after shifting. Please try a different numero.`);
                }
                // Create the new article with the specified numero
                await tx.article.create({
                    data: data,
                });
                // Fetch the created article with category using repository
                const created = await this.articleRepository.findByCondition({ where: { name: data.name, category_id: data.category_id } }, { includeCategory: true });
                return created[0];
            });
            return created;
        }
        // No numero provided: create as-is
        return await this.articleRepository.create(data, { includeCategory: true });
    }
    async getArticleById(id) {
        return await this.articleRepository.findById(id, { includeCategory: true });
    }
    async updateArticle(id, data) {
        if (data.price && Number(data.price) <= 0) {
            throw new Error("Price must be positive");
        }
        const current = await this.articleRepository.findById(id);
        if (!current) {
            throw new Error("Article not found");
        }
        const oldNumero = current.numero ?? null;
        // If numero is being updated/defined
        if (data.numero !== undefined && data.numero !== null) {
            const newNumero = Number(data.numero);
            if (!Number.isInteger(newNumero) || newNumero < 0) {
                throw new Error("Numero must be a non-negative integer");
            }
            // Handle the case where numero is not changing
            if (newNumero === oldNumero) {
                return await this.articleRepository.update(id, data, {
                    includeCategory: true,
                });
            }
            // Perform GLOBAL numero shifting operation
            const updated = await this.prisma.$transaction(async (tx) => {
                // First, set the current article's numero to null to free up the position
                if (oldNumero !== null) {
                    await tx.article.update({
                        where: { id },
                        data: { numero: null },
                    });
                    // Close the gap left by removing this article (GLOBAL shift)
                    await tx.article.updateMany({
                        where: { numero: { gt: oldNumero } },
                        data: { numero: { decrement: 1 } },
                    });
                }
                // Shift ALL articles with numero >= newNumero to make space (GLOBAL shift)
                await tx.article.updateMany({
                    where: { numero: { gte: newNumero } },
                    data: { numero: { increment: 1 } },
                });
                // Update the article with the new numero
                const result = await tx.article.update({
                    where: { id },
                    data: { ...data, numero: newNumero },
                    include: { category: { select: { id: true, name: true } } },
                });
                return result;
            });
            return updated;
        }
        // If numero is not being updated, just update other fields
        return await this.articleRepository.update(id, data, {
            includeCategory: true,
        });
    }
    async deleteArticle(id) {
        return await this.articleRepository.delete(id, { includeCategory: true });
    }
    async getArticleByCommandeCategory(categoryId) {
        return await this.articleRepository.findByCommandeCategory(categoryId, {
            includeCategory: true,
        });
    }
    async getAllArticles(queryObject = {}) {
        return await this.articleRepository.findByCondition(queryObject, {
            includeCategory: true,
        });
    }
    async getArticlesByCategory(categoryId) {
        return await this.articleRepository.findByCondition({ where: { category_id: categoryId } }, { includeCategory: true });
    }
}
