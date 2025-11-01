export class CategoryService {
    categoryRepository;
    prisma;
    constructor(categoryRepository, prisma) {
        this.categoryRepository = categoryRepository;
        this.prisma = prisma;
    }
    async getCategories(queryObject) {
        return this.categoryRepository.findByCondition(queryObject || {});
    }
    async getPaginatedCategories(queryObject) {
        return this.categoryRepository.findPaginated(queryObject);
    }
    async getCategoryById(id) {
        return this.categoryRepository.findById(id);
    }
    async createCategory(data) {
        return this.categoryRepository.create(data);
    }
    async updateCategory(id, data) {
        return this.categoryRepository.update(id, data);
    }
    async deleteCategory(id) {
        // Check if category has associated articles
        const articles = await this.prisma.article.findMany({
            where: { category_id: id },
        });
        if (articles.length > 0) {
            throw new Error(`Cannot delete category. It has ${articles.length} associated articles. Please delete the articles first.`);
        }
        // Check if category has associated bon de commande entries
        const bonDeCommandeEntries = await this.prisma.bonDeCommandeCategory.findMany({
            where: { category_id: id },
        });
        if (bonDeCommandeEntries.length > 0) {
            throw new Error(`Cannot delete category. It has ${bonDeCommandeEntries.length} associated bon de commande entries. Please delete the bon de commande entries first.`);
        }
        return this.categoryRepository.delete(id);
    }
    async softDeleteCategory(id) {
        return this.categoryRepository.softDelete(id);
    }
    async deleteCategoryWithCascade(id) {
        // Delete all associated articles first
        await this.prisma.article.deleteMany({
            where: { category_id: id },
        });
        // Delete all associated bon de commande entries
        await this.prisma.bonDeCommandeCategory.deleteMany({
            where: { category_id: id },
        });
        // Now delete the category
        return this.categoryRepository.delete(id);
    }
}
