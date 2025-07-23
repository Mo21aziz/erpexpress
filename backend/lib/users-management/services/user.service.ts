import { IQueryObject } from "../../../prisma/interfaces/query-params";
import { Paginated } from "../../../prisma/interfaces/pagination";
import { User, Role } from "../../../types/user";
import { UserRepository } from "../repositories/user.repository";
import { hashPassword } from "../../../lib/utils/hash.util";
import { PrismaClient } from "@prisma/client";

interface RolePermission {
  permission: {
    label: string;
  };
}

interface UserWithRole extends Omit<User, 'role'> {
  role?: Role | null;
}

export class UserService {
  private userRepository: UserRepository;
  private prisma: PrismaClient;

  constructor(userRepository: UserRepository, prisma: PrismaClient) {
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async getPaginatedUsers(queryObject: IQueryObject): Promise<Paginated<User>> {
    return this.userRepository.findPaginated(queryObject);
  }

  async getAllUsers(queryObject: IQueryObject): Promise<User[]> {
    return this.userRepository.findByCondition(queryObject);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByCondition(queryObject: IQueryObject) {
    return this.userRepository.findOneByCondition(queryObject);
  }

  async createUser(data: Partial<User>): Promise<User> {
    const user = await this.getUserByCondition({
      filter: `(username||$eq||${data.username};email||$eq||${data.email})`,
    });
    if (user) {
      throw new Error("User already exists");
    }
    const hashedPassword = data.password && (await hashPassword(data.password));
    data.password = hashedPassword;
    return this.userRepository.create(data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<User> {
    return this.userRepository.delete(id);
  }

  async countUsers(where: any = {}): Promise<number> {
    return this.userRepository.count(where);
  }

  async findOneByCondition(queryObject: IQueryObject): Promise<User | null> {
    return this.userRepository.findOneByCondition(queryObject);
  }

  async getUserWithRole(userId: string): Promise<UserWithRole | null> {
    try {
      // Debug: log the type and value of userId
      console.debug("Fetching user with role:", userId, typeof userId);
      
      // Always use string for id filter
      const idString = String(userId);
      const user = await this.userRepository.findOneByCondition({
        filter: `id||$eq||${idString}`,
        join: "role"
      }) as UserWithRole;

      if (!user) {
        console.debug("User not found:", userId);
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error fetching user with role:", error);
      throw new Error("Failed to fetch user with role");
    }
  }
}

