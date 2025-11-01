"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRoles = seedRoles;
const client_1 = require("@prisma/client");
const role_data_1 = require("../data/role.data");
async function seedRoles() {
    const prisma = new client_1.PrismaClient();
    try {
        const upsertPromises = role_data_1.roles.map((role) => prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: {
                name: role.name,
            },
        }));
        await Promise.all(upsertPromises);
    }
    catch (error) {
        console.error("Error seeding roles:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
