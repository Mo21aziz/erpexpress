import { IQueryObject } from "../../../prisma/interfaces/query-params";
import { Paginated } from "../../../prisma/interfaces/pagination";
import {
  User,
  CreateUserInput,
  UserWithRole,
  UpdateUserInput,
} from "../../../types/user";
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

  async createUser(
    data: CreateUserInput & { assigned_employee_ids?: string[] }
  ): Promise<User> {
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

    // Create user with potential Gerant assignments
    return await this.prisma.$transaction(async (tx) => {
      const user = await this.userRepository.create({
        ...data,
        password: hashedPassword,
      });

      // If this is a Gerant role and employee IDs are provided, create assignments
      if (
        roleExists.name === "Gerant" &&
        data.assigned_employee_ids &&
        data.assigned_employee_ids.length > 0
      ) {
        // Verify all user IDs exist and get their employee records
        const usersToAssign = await tx.user.findMany({
          where: { id: { in: data.assigned_employee_ids } },
          include: { employee: true },
        });

        if (usersToAssign.length !== data.assigned_employee_ids.length) {
          throw new Error("Some user IDs are invalid");
        }

        // Create Gerant-Employee assignments
        const assignmentData = [];
        for (const userToAssign of usersToAssign) {
          // If user doesn't have an employee record, create one
          let employeeId = userToAssign.employee?.id;
          if (!employeeId) {
            const employee = await tx.employee.create({
              data: { user_id: userToAssign.id },
            });
            employeeId = employee.id;
          }

          assignmentData.push({
            gerant_id: user.id,
            employee_id: employeeId,
          });
        }

        await tx.gerantEmployeeAssignment.createMany({
          data: assignmentData,
        });
      }

      return user;
    });
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    console.log("UserService.updateUser called with:", { id, data }); // Debug log
    return await this.prisma.$transaction(async (tx) => {
      // Get the user's current role
      const currentUser = await tx.user.findUnique({
        where: { id },
        include: { role: true },
      });

      if (!currentUser) {
        throw new Error("User not found");
      }

      console.log("Current user:", currentUser); // Debug log

      // Update user data
      const updatedUser = await this.userRepository.update(id, data);
      console.log("Updated user:", updatedUser); // Debug log

      // Handle Gerant employee assignments if role is being changed to Gerant or if assignments are being updated
      if (data.role_id) {
        const newRole = await tx.role.findUnique({
          where: { id: data.role_id },
        });

        console.log("New role:", newRole); // Debug log

        if (newRole?.name === "Gerant" && data.assigned_employee_ids) {
          console.log(
            "Handling Gerant role with assigned employees:",
            data.assigned_employee_ids
          ); // Debug log
          // Remove existing assignments
          await tx.gerantEmployeeAssignment.deleteMany({
            where: { gerant_id: id },
          });

          // Create new assignments if employee IDs are provided
          if (data.assigned_employee_ids.length > 0) {
            // Get the users to be assigned
            const usersToAssign = await tx.user.findMany({
              where: { id: { in: data.assigned_employee_ids } },
              include: { employee: true },
            });

            console.log("Users to assign:", usersToAssign); // Debug log

            if (usersToAssign.length !== data.assigned_employee_ids.length) {
              throw new Error("Some user IDs are invalid");
            }

            const assignmentData = [];
            for (const userToAssign of usersToAssign) {
              // If user doesn't have an employee record, create one
              let employeeId = userToAssign.employee?.id;
              if (!employeeId) {
                const employee = await tx.employee.create({
                  data: { user_id: userToAssign.id },
                });
                employeeId = employee.id;
              }

              assignmentData.push({
                gerant_id: id, // Use the current user's ID as gerant_id
                employee_id: employeeId,
              });
            }

            console.log("Assignment data:", assignmentData); // Debug log

            await tx.gerantEmployeeAssignment.createMany({
              data: assignmentData,
            });
          }
        } else if (newRole?.name !== "Gerant") {
          // If role is being changed from Gerant to something else, remove all assignments
          await tx.gerantEmployeeAssignment.deleteMany({
            where: { gerant_id: id },
          });
        }
      } else if (
        currentUser.role.name === "Gerant" &&
        data.assigned_employee_ids
      ) {
        console.log(
          "Updating assignments for existing Gerant:",
          data.assigned_employee_ids
        ); // Debug log
        // Update assignments for existing Gerant
        await tx.gerantEmployeeAssignment.deleteMany({
          where: { gerant_id: id },
        });

        if (data.assigned_employee_ids.length > 0) {
          // Get the users to be assigned
          const usersToAssign = await tx.user.findMany({
            where: { id: { in: data.assigned_employee_ids } },
            include: { employee: true },
          });

          console.log("Users to assign:", usersToAssign); // Debug log

          if (usersToAssign.length !== data.assigned_employee_ids.length) {
            throw new Error("Some user IDs are invalid");
          }

          const assignmentData = [];
          for (const userToAssign of usersToAssign) {
            // If user doesn't have an employee record, create one
            let employeeId = userToAssign.employee?.id;
            if (!employeeId) {
              const employee = await tx.employee.create({
                data: { user_id: userToAssign.id },
              });
              employeeId = employee.id;
            }

            assignmentData.push({
              gerant_id: id, // Use the current user's ID as gerant_id
              employee_id: employeeId,
            });
          }

          console.log("Assignment data:", assignmentData); // Debug log

          await tx.gerantEmployeeAssignment.createMany({
            data: assignmentData,
          });
        }
      }

      return updatedUser;
    });
  }

  async deleteUser(id: string): Promise<User> {
    console.log("UserService.deleteUser called with ID:", id); // Debug log

    return await this.prisma.$transaction(async (tx) => {
      // First, get the user to check what related records exist
      const user = await tx.user.findUnique({
        where: { id },
        include: {
          employee: true,
          admin: true,
          gerant_assignments: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      console.log("User to delete:", user); // Debug log

      // Delete related records in the correct order

      // 1. Delete GerantEmployeeAssignment records (if user is a Gerant)
      if (user.gerant_assignments && user.gerant_assignments.length > 0) {
        console.log(
          "Deleting GerantEmployeeAssignment records:",
          user.gerant_assignments.length
        );
        await tx.gerantEmployeeAssignment.deleteMany({
          where: { gerant_id: id },
        });
      }

      // 2. Delete BonDeCommandeCategory records first (if user has employee record)
      if (user.employee) {
        console.log("Deleting BonDeCommandeCategory records for employee");
        // First get all bon de commandes for this employee
        const bonDeCommandes = await tx.bonDeCommande.findMany({
          where: { employee_id: user.employee.id },
          select: { id: true },
        });

        if (bonDeCommandes.length > 0) {
          const bonDeCommandeIds = bonDeCommandes.map((bdc) => bdc.id);
          console.log("Found BonDeCommande IDs:", bonDeCommandeIds);

          // Delete BonDeCommandeCategory records that reference these bon de commandes
          await tx.bonDeCommandeCategory.deleteMany({
            where: { bon_de_commande_id: { in: bonDeCommandeIds } },
          });
        }
      }

      // 3. Delete BonDeCommande records (if user has employee record)
      if (user.employee) {
        console.log("Deleting BonDeCommande records for employee");
        await tx.bonDeCommande.deleteMany({
          where: { employee_id: user.employee.id },
        });
      }

      // 4. Delete Employee record (if exists)
      if (user.employee) {
        console.log("Deleting Employee record");
        await tx.employee.delete({
          where: { id: user.employee.id },
        });
      }

      // 5. Delete Admin record (if exists)
      if (user.admin) {
        console.log("Deleting Admin record");
        await tx.admin.delete({
          where: { id: user.admin.id },
        });
      }

      // 6. Finally, delete the User record
      console.log("Deleting User record");
      const deletedUser = await tx.user.delete({
        where: { id },
        include: {
          role: true,
        },
      });

      console.log("User deleted successfully:", deletedUser);
      return deletedUser;
    });
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

  // New method to get all users for Gerant assignment
  async getAllEmployees(): Promise<any[]> {
    return await this.prisma.user.findMany({
      include: {
        role: true,
        employee: true,
      },
      where: {
        // Exclude users who are already Gerants to avoid circular assignments
        role: {
          name: {
            not: "Gerant",
          },
        },
      },
    });
  }

  // New method to get Gerant's assigned employees
  async getGerantAssignedEmployees(gerantId: string): Promise<any[]> {
    const assignments = await this.prisma.gerantEmployeeAssignment.findMany({
      where: { gerant_id: gerantId },
      include: {
        employee: {
          include: {
            user: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    return assignments.map((assignment) => assignment.employee);
  }
}
