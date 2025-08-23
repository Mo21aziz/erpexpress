import { PrismaClient } from "@prisma/client";
import { BonDeCommandeRepository } from "../repositories/bon-de-commande.repository";

export interface CreateBonDeCommandeData {
  description: string;
  status: string;
  employee_id?: string; // Made optional since backend will auto-assign
  created_at: Date;
  target_date: Date;
  category_id: string;
  article_id: string; // Required for individual article entries
  quantite_a_stocker: number;
  quantite_a_demander: number;
}

export interface BonDeCommande {
  id: string;
  code: string;
  created_at: Date;
  target_date: Date;
  description: string;
  status: string;
  employee_id: string;
  employee?: {
    id: string;
    user_id: string;
    user?: {
      id: string;
      username: string;
      email: string;
    };
  };
  categories: {
    id: string;
    category_id: string;
    article_id?: string;
    bon_de_commande_id: string;
    quantite_a_stocker: number;
    quantite_a_demander: number;
    category: {
      id: string;
      name: string;
      description: string;
    };
    article?: {
      id: string;
      name: string;
      description: string;
    };
  }[];
}

export class BonDeCommandeService {
  constructor(
    private bonDeCommandeRepository: BonDeCommandeRepository,
    private prisma: PrismaClient
  ) {}

  private async generateNextCode(): Promise<string> {
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

  async createBonDeCommande(
    data: CreateBonDeCommandeData
  ): Promise<BonDeCommande> {
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
      })) as BonDeCommande;
    });
  }

  async getAllBonDeCommande(
    userId?: string,
    userRole?: string
  ): Promise<BonDeCommande[]> {
    // Build the where clause based on user role
    let whereClause: any = {};

    console.log(
      `[BonDeCommandeService] getAllBonDeCommande called with userId: ${userId}, userRole: ${userRole}`
    );

    // If user is not admin or responsible, only show their own bon de commande
    if (userRole !== "Admin" && userRole !== "Responsible" && userId) {
      console.log(
        `[BonDeCommandeService] User is not admin/responsible, filtering by employee_id`
      );
      // Find the employee record for this user
      const employee = await this.prisma.employee.findFirst({
        where: { user_id: userId },
      });

      if (employee) {
        whereClause.employee_id = employee.id;
        console.log(
          `[BonDeCommandeService] Found employee record, filtering by employee_id: ${employee.id}`
        );
      } else {
        console.log(
          `[BonDeCommandeService] No employee record found for user: ${userId}`
        );
      }
    } else {
      console.log(
        `[BonDeCommandeService] User is admin/responsible, showing all bon de commande`
      );
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

  async getBonDeCommandeById(id: string): Promise<BonDeCommande | null> {
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

  async updateBonDeCommande(
    id: string,
    data: Partial<CreateBonDeCommandeData>
  ): Promise<BonDeCommande> {
    return await this.prisma.$transaction(async (tx) => {
      const updateData: any = {};

      if (data.description) updateData.description = data.description;
      if (data.status) updateData.status = data.status;
      if (data.employee_id) updateData.employee_id = data.employee_id;
      if (data.created_at) updateData.created_at = data.created_at;

      // Update the bon de commande
      await tx.bonDeCommande.update({
        where: { id },
        data: updateData,
      });

      // Update the quantities in BonDeCommandeCategory if provided
      if (
        data.quantite_a_stocker !== undefined ||
        data.quantite_a_demander !== undefined
      ) {
        const updateCategoryData: any = {};
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
      })) as BonDeCommande;
    });
  }

  async deleteBonDeCommande(id: string): Promise<BonDeCommande> {
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
