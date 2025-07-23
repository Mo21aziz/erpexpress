// lib/container.ts
import { PrismaClient } from "@prisma/client";
import { UserService } from "./users-management/services/user.service";
import { UserRepository } from "./users-management/repositories/user.repository";
import { RoleRepository } from "./users-management/repositories/role.repository";
import { RoleService } from "./users-management/services/role.service";

import { AuthService } from "./auth/services/auth.service";




const prisma = new PrismaClient();

// user-management + auth
const userService = new UserService(new UserRepository(prisma), prisma);
const authService = new AuthService(userService);
const roleService = new RoleService(
  new RoleRepository(prisma),
);





const container = {
  // Existing services
  AuthService: authService,
  UserService: userService,
  RoleService: roleService,
 

  // Chat services


  // Prisma client
  prisma,
};

export default container;
