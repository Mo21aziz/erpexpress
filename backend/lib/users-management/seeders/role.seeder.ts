import { PrismaClient } from "@prisma/client";
import { roles } from "../data/role.data";

export async function seedRoles() {
  const prisma = new PrismaClient();

  try {
    const upsertPromises = roles.map((role) =>
      prisma.role.upsert({
        where: { label: role.label },
        update: {
          description: role.description,
        },
        create: {
          label: role.label,
          description: role.description,
        },
      })
    );
    await Promise.all(upsertPromises);
  } catch (error) {
    console.error("Error seeding roles:", error);
  } finally {
    await prisma.$disconnect();
  }
}
