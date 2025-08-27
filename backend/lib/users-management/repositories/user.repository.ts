import { PrismaClient } from "@prisma/client";
import { BaseRepository } from "../../../prisma/repositories/prisma-abstract-repository";
import { CreateUserInput, UpdateUserInput, User } from "../../../types/user";

export class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma.user, prisma);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
      include: {
        role: true,
        employee: true,
        admin: true,
      },
    });
  }

  async create(data: CreateUserInput): Promise<User> {
    // Destructure role_id and assigned_employee_ids from the user data
    const { role_id, assigned_employee_ids, ...userData } = data;
    return this.model.create({
      data: {
        ...userData,
        role: { connect: { id: role_id } },
      },
      include: {
        role: true,
        employee: true,
        admin: true,
      },
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    // Destructure role_id and assigned_employee_ids from the user data
    const { role_id, assigned_employee_ids, ...userData } = data;
    return this.model.update({
      where: { id },
      data: {
        ...userData,
        ...(role_id ? { role: { connect: { id: role_id } } } : {}),
      },
      include: {
        role: true,
        employee: true,
        admin: true,
      },
    });
  }
}
