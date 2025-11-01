export class BonDeCommandeRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return await this.prisma.bonDeCommande.create({
            data,
            include: {
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }
    async findById(id) {
        return await this.prisma.bonDeCommande.findUnique({
            where: { id },
            include: {
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }
    async findAll() {
        return await this.prisma.bonDeCommande.findMany({
            include: {
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });
    }
    async update(id, data) {
        return await this.prisma.bonDeCommande.update({
            where: { id },
            data,
            include: {
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }
    async delete(id) {
        return await this.prisma.bonDeCommande.delete({
            where: { id },
            include: {
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }
}
