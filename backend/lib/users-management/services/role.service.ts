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

  async getRoleById(id: number): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  async createRole(data: Partial<Role>): Promise<Role> {
    return this.roleRepository.create(data);
  }

  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    return this.roleRepository.update(id, data);
  }

  async duplicateRole(roleId: number) {
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

  async deleteRole(id: number): Promise<Role> {
    return this.roleRepository.softDelete(id);
  }

  async countRoles(where: any = {}): Promise<number> {
    return this.roleRepository.count(where);
  }
}
