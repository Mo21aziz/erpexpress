import { RoleRepository } from "../repositories/role.repository";
import { IQueryObject } from "../../../prisma/interfaces/query-params";
import { Paginated } from "../../../prisma/interfaces/pagination";
import { Role } from "../../../types/user";

export class RoleService {
  private roleRepository: RoleRepository;

  constructor(roleRepository: RoleRepository) {
    this.roleRepository = roleRepository;
  }

  async getPaginatedRoles(queryObject: IQueryObject): Promise<Paginated<Role>> {
    return this.roleRepository.findPaginated(queryObject);
  }

  async getAllRoles(queryObject: IQueryObject): Promise<Role[]> {
    return this.roleRepository.findByCondition(queryObject);
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  async createRole(data: Partial<Role>): Promise<Role> {
    // Filter out fields that don't exist in the Prisma schema
    const { description, permissions, createdAt, updatedAt, ...roleData } =
      data as any;
    return this.roleRepository.create(roleData);
  }

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    // Filter out fields that don't exist in the Prisma schema
    const { description, permissions, createdAt, updatedAt, ...roleData } =
      data as any;
    return this.roleRepository.update(id, roleData);
  }

  async duplicateRole(roleId: string) {
    const role = await this.roleRepository.findOneByCondition({
      filter: `id||$eq||${roleId}`,
    });
    if (role) {
      return this.createRole({
        name: `${role.name} Duplicate`,
        // Copy other fields as needed
      });
    }
  }

  async deleteRole(id: string): Promise<Role> {
    return this.roleRepository.delete(id);
  }

  async countRoles(where: any = {}): Promise<number> {
    return this.roleRepository.count(where);
  }
}
