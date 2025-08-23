import { IQueryObject } from "../../../prisma/interfaces/query-params";
import { Paginated } from "../../../prisma/interfaces/pagination";
import { User, CreateUserInput, UserWithRole } from "../../../types/user";
import { UserRepository } from "../repositories/user.repository";
import { hashPassword } from "../../../lib/utils/hash.util";
import { PrismaClient } from "@prisma/client";
import { ParsedQs } from "qs";

export class UserService {
  countUsers(query: ParsedQs) {
    throw new Error("Method not implemented.");
  }
  constructor(
    private userRepository: UserRepository,
    private prisma: PrismaClient
  ) {}

  async getPaginatedUsers(queryObject: IQueryObject): Promise<Paginated<User>> {
    return this.userRepository.findPaginated(queryObject);
  }

  async getAllUsers(queryObject: IQueryObject): Promise<UserWithRole[]> {
    // Always include role data when fetching all users
    const queryWithRole = {
      ...queryObject,
      join: queryObject.join ? `${queryObject.join},role` : "role",
    };
    return this.userRepository.findByCondition(queryWithRole) as Promise<
      UserWithRole[]
    >;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByCondition(queryObject: IQueryObject): Promise<User | null> {
    return this.userRepository.findOneByCondition(queryObject);
  }

  async createUser(data: CreateUserInput): Promise<User> {
    // Validate required fields
    if (!data.role_id) {
      throw new Error("Role ID is required");
    }

    // Check if user exists
    const existingUser = await this.getUserByCondition({
      filter: `(username||$eq||${data.username};email||$eq||${data.email})`,
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Verify role exists
    const roleExists = await this.prisma.role.findUnique({
      where: { id: data.role_id },
    });

    if (!roleExists) {
      throw new Error("Specified role does not exist");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    return this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<User> {
    return this.userRepository.delete(id);
  }

  async getUserWithRole(userId: string): Promise<UserWithRole | null> {
    try {
      const user = await this.userRepository.findOneByCondition({
        filter: `id||$eq||${userId}`,
        join: "role",
      });

      return user as UserWithRole;
    } catch (error) {
      console.error("Error fetching user with role:", error);
      throw new Error("Failed to fetch user with role");
    }
  }

  async getDefaultRole(): Promise<string> {
    const defaultRole = await this.prisma.role.findFirst({
      where: { name: "USER" },
    });

    if (!defaultRole) {
      throw new Error("Default role not found");
    }

    return defaultRole.id;
  }
}
