// backend/insert-user.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function insertUser() {
  try {
    console.log("🔍 Checking if role exists...");

    // First, let's check if the role exists
    const role = await prisma.role.findUnique({
      where: { id: "79fd746a-4d18-42f2-83df-31904488f343" },
    });

    if (!role) {
      console.log("❌ Role not found. Available roles:");
      const allRoles = await prisma.role.findMany();
      allRoles.forEach((r) => console.log(`  - ${r.id}: ${r.name}`));
      return;
    }

    console.log(`✅ Role found: ${role.name}`);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: "kamel" }, { email: "kamel@example.com" }],
      },
    });

    if (existingUser) {
      console.log(
        '❌ User already exists with username "kamel" or email "kamel@example.com"'
      );
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("kamel123", 10);
    console.log("✅ Password hashed successfully");

    // Create the user
    const user = await prisma.user.create({
      data: {
        username: "kamel",
        email: "kamel@example.com",
        password: hashedPassword,
        role_id: "79fd746a-4d18-42f2-83df-31904488f343",
      },
      include: {
        role: true,
      },
    });

    console.log("✅ User created successfully:");
    console.log(`  - ID: ${user.id}`);
    console.log(`  - Username: ${user.username}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Role: ${user.role.name}`);
  } catch (error) {
    console.error("❌ Error creating user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

insertUser();
