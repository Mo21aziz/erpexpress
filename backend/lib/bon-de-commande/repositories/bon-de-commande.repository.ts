import { PrismaClient } from "@prisma/client";

export class BonDeCommandeRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: any) {
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

  async findById(id: string) {
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

  async update(id: string, data: any) {
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

  async delete(id: string) {
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
