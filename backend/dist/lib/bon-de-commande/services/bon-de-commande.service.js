"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonDeCommandeService = void 0;
class BonDeCommandeService {
    bonDeCommandeRepository;
    prisma;
    constructor(bonDeCommandeRepository, prisma) {
        this.bonDeCommandeRepository = bonDeCommandeRepository;
        this.prisma = prisma;
    }
    async generateNextCode() {
        // Get the last bon de commande to find the highest code number
        const lastBonDeCommande = await this.prisma.bonDeCommande.findFirst({
            orderBy: {
                code: "desc",
            },
        });
        if (!lastBonDeCommande) {
            return "BC-01";
        }
        // Extract the number from the last code (e.g., "BC-15" -> 15)
        const lastNumber = parseInt(lastBonDeCommande.code.replace("BC-", ""));
        const nextNumber = lastNumber + 1;
        // Format with leading zeros (e.g., 2 -> "02")
        return `BC-${nextNumber.toString().padStart(2, "0")}`;
    }
    async createBonDeCommande(data) {
        return await this.prisma.$transaction(async (tx) => {
            // Ensure employee_id is provided
            if (!data.employee_id) {
                throw new Error("Employee ID is required");
            }
            // Generate the next code
            const code = await this.generateNextCode();
            // Create the bon de commande
            const bonDeCommande = await tx.bonDeCommande.create({
                data: {
                    code,
                    description: data.description,
                    status: data.status,
                    employee_id: data.employee_id,
                    created_at: data.created_at,
                    target_date: data.target_date,
                },
            });
            // Create the bon de commande category relationship
            await tx.bonDeCommandeCategory.create({
                data: {
                    bon_de_commande_id: bonDeCommande.id,
                    category_id: data.category_id,
                    article_id: data.article_id,
                    quantite_a_stocker: data.quantite_a_stocker,
                    quantite_a_demander: data.quantite_a_demander,
                },
            });
            // Return the created bon de commande with categories
            return (await tx.bonDeCommande.findUnique({
                where: { id: bonDeCommande.id },
                include: {
                    employee: {
                        include: {
                            user: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                            article: true,
                        },
                    },
                },
            }));
        });
    }
    async getAllBonDeCommande(userId, userRole) {
        // Build the where clause based on user role
        let whereClause = {};
        console.log(`[BonDeCommandeService] getAllBonDeCommande called with userId: ${userId}, userRole: ${userRole}`);
        // Normalize role casing for reliable comparisons
        const normalizedRole = (userRole || "").toLowerCase();
        // If user is Gerant, show bon de commande from assigned employees
        // and limit to last 48 hours
        if (normalizedRole === "gerant" && userId) {
            console.log(`[BonDeCommandeService] User is Gerant, filtering by assigned employees and last 48 hours`);
            // Get the Gerant's assigned employees
            const assignedEmployees = await this.prisma.gerantEmployeeAssignment.findMany({
                where: { gerant_id: userId },
                include: {
                    employee: true,
                },
            });
            const assignedEmployeeIds = assignedEmployees.map((assignment) => assignment.employee_id);
            if (assignedEmployeeIds.length > 0) {
                whereClause.employee_id = { in: assignedEmployeeIds };
                // Add 48-hour time restriction for Gerant
                const fortyEightHoursAgo = new Date();
                fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
                whereClause.created_at = {
                    gte: fortyEightHoursAgo,
                };
                console.log(`[BonDeCommandeService] Filtering by assigned employee IDs: ${assignedEmployeeIds.join(", ")} and created_at >= ${fortyEightHoursAgo.toISOString()}`);
            }
            else {
                // If no employees assigned, return empty array
                console.log(`[BonDeCommandeService] No employees assigned to Gerant, returning empty array`);
                return [];
            }
        }
        // If user is not admin, responsible, or gerant, only show their own bon de commande
        // No time restriction for employees
        else if (normalizedRole !== "admin" &&
            normalizedRole !== "responsible" &&
            normalizedRole !== "gerant" &&
            userId) {
            console.log(`[BonDeCommandeService] User is not admin/responsible/gerant, filtering by employee_id and last 48 hours`);
            // Find the employee record for this user
            const employee = await this.prisma.employee.findFirst({
                where: { user_id: userId },
            });
            if (employee) {
                whereClause.employee_id = employee.id;
                console.log(`[BonDeCommandeService] Found employee record, filtering by employee_id (no time restriction): ${employee.id}`);
            }
            else {
                console.log(`[BonDeCommandeService] No employee record found for user: ${userId}. Returning empty list for employee role.`);
                return [];
            }
        }
        else if (normalizedRole === "admin" || normalizedRole === "responsible") {
            console.log(`[BonDeCommandeService] User is admin/responsible, showing all bon de commande`);
        }
        console.log(`[BonDeCommandeService] Final whereClause:`, whereClause);
        return await this.prisma.bonDeCommande.findMany({
            where: whereClause,
            include: {
                employee: {
                    include: {
                        user: {
                            include: {
                                role: true, // Include role information
                            },
                        },
                    },
                },
                categories: {
                    include: {
                        category: true,
                        article: true,
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });
    }
    async getBonDeCommandeById(id) {
        return await this.prisma.bonDeCommande.findUnique({
            where: { id },
            include: {
                employee: {
                    include: {
                        user: true,
                    },
                },
                categories: {
                    include: {
                        category: true,
                        article: true,
                    },
                },
            },
        });
    }
    async updateBonDeCommande(id, data) {
        return await this.prisma.$transaction(async (tx) => {
            // First check if the bon de commande exists and its status
            const existingBonDeCommande = await tx.bonDeCommande.findUnique({
                where: { id },
            });
            if (!existingBonDeCommande) {
                throw new Error("Bon de commande not found");
            }
            // Prevent updates if status is "confirmer"
            if (existingBonDeCommande.status === "confirmer") {
                throw new Error("Cannot update a confirmed bon de commande");
            }
            const updateData = {};
            if (data.description)
                updateData.description = data.description;
            if (data.status)
                updateData.status = data.status;
            if (data.employee_id)
                updateData.employee_id = data.employee_id;
            if (data.created_at)
                updateData.created_at = data.created_at;
            // Update the bon de commande
            await tx.bonDeCommande.update({
                where: { id },
                data: updateData,
            });
            // Update the quantities in BonDeCommandeCategory if provided
            if (data.quantite_a_stocker !== undefined ||
                data.quantite_a_demander !== undefined) {
                const updateCategoryData = {};
                if (data.quantite_a_stocker !== undefined)
                    updateCategoryData.quantite_a_stocker = data.quantite_a_stocker;
                if (data.quantite_a_demander !== undefined)
                    updateCategoryData.quantite_a_demander = data.quantite_a_demander;
                await tx.bonDeCommandeCategory.updateMany({
                    where: { bon_de_commande_id: id },
                    data: updateCategoryData,
                });
            }
            // Return the updated bon de commande with categories
            return (await tx.bonDeCommande.findUnique({
                where: { id },
                include: {
                    employee: {
                        include: {
                            user: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
            }));
        });
    }
    async updateStatus(id, status) {
        // Validate status
        if (status !== "en attente" && status !== "confirmer") {
            throw new Error("Status must be 'en attente' or 'confirmer'");
        }
        return await this.prisma.$transaction(async (tx) => {
            // If confirming, ensure all categories and articles are present
            if (status === "confirmer") {
                await this.ensureCompleteBonDeCommande(tx, id);
            }
            return await tx.bonDeCommande.update({
                where: { id },
                data: { status },
                include: {
                    employee: {
                        include: {
                            user: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                            article: true,
                        },
                    },
                },
            });
        });
    }
    async ensureCompleteBonDeCommande(tx, bonDeCommandeId) {
        console.log(`[BonDeCommandeService] Ensuring complete bon de commande for ID: ${bonDeCommandeId}`);
        // Get all categories and articles
        const allCategories = await tx.category.findMany();
        const allArticles = await tx.article.findMany();
        console.log(`[BonDeCommandeService] Found ${allCategories.length} categories and ${allArticles.length} articles`);
        // Get current bon de commande with its categories
        const currentBonDeCommande = await tx.bonDeCommande.findUnique({
            where: { id: bonDeCommandeId },
            include: {
                categories: {
                    include: {
                        category: true,
                        article: true,
                    },
                },
            },
        });
        if (!currentBonDeCommande) {
            throw new Error("Bon de commande not found");
        }
        console.log(`[BonDeCommandeService] Current bon de commande has ${currentBonDeCommande.categories.length} categories`);
        // Get existing category and article IDs
        const existingCategoryIds = new Set(currentBonDeCommande.categories
            .map((c) => c.category?.id)
            .filter(Boolean));
        const existingArticleIds = new Set(currentBonDeCommande.categories
            .map((c) => c.article?.id)
            .filter(Boolean));
        console.log(`[BonDeCommandeService] Existing category IDs:`, Array.from(existingCategoryIds));
        console.log(`[BonDeCommandeService] Existing article IDs:`, Array.from(existingArticleIds));
        // Find missing categories
        const missingCategories = allCategories.filter((cat) => cat && cat.id && !existingCategoryIds.has(cat.id));
        // Find missing articles
        const missingArticles = allArticles.filter((art) => art && art.id && !existingArticleIds.has(art.id));
        console.log(`[BonDeCommandeService] Missing categories:`, missingCategories.map((c) => c.name));
        console.log(`[BonDeCommandeService] Missing articles:`, missingArticles.map((a) => a.name));
        // Add missing categories with zero quantities
        for (const category of missingCategories) {
            console.log(`[BonDeCommandeService] Adding missing category: ${category.name}`);
            await tx.bonDeCommandeCategory.create({
                data: {
                    bon_de_commande_id: bonDeCommandeId,
                    category_id: category.id,
                    article_id: null, // Category-level entry
                    quantite_a_stocker: 0,
                    quantite_a_demander: 0,
                },
            });
        }
        // Add missing articles with zero quantities
        for (const article of missingArticles) {
            console.log(`[BonDeCommandeService] Adding missing article: ${article.name} (category: ${article.category_id})`);
            await tx.bonDeCommandeCategory.create({
                data: {
                    bon_de_commande_id: bonDeCommandeId,
                    category_id: article.category_id,
                    article_id: article.id,
                    quantite_a_stocker: 0,
                    quantite_a_demander: 0,
                },
            });
        }
        console.log(`[BonDeCommandeService] Completed adding missing categories and articles`);
    }
    async updateCategory(id, data) {
        return await this.prisma.$transaction(async (tx) => {
            // First get the category to find the bon de commande
            const category = await tx.bonDeCommandeCategory.findUnique({
                where: { id },
                include: {
                    bon_de_commande: true,
                },
            });
            if (!category) {
                throw new Error("Category not found");
            }
            // Check if the bon de commande is confirmed
            if (category.bon_de_commande.status === "confirmer") {
                throw new Error("Cannot update quantities of a confirmed bon de commande");
            }
            // Update the category
            return await tx.bonDeCommandeCategory.update({
                where: { id },
                data,
                include: {
                    category: true,
                    article: true,
                },
            });
        });
    }
    async deleteBonDeCommande(id) {
        return await this.prisma.$transaction(async (tx) => {
            // Delete related bon de commande categories first
            await tx.bonDeCommandeCategory.deleteMany({
                where: { bon_de_commande_id: id },
            });
            // Delete the bon de commande
            return await tx.bonDeCommande.delete({
                where: { id },
                include: {
                    employee: {
                        include: {
                            user: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
            });
        });
    }
}
exports.BonDeCommandeService = BonDeCommandeService;
