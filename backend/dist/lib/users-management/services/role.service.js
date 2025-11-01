export class RoleService {
    roleRepository;
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async getPaginatedRoles(queryObject) {
        return this.roleRepository.findPaginated(queryObject);
    }
    async getAllRoles(queryObject) {
        return this.roleRepository.findByCondition(queryObject);
    }
    async getRoleById(id) {
        return this.roleRepository.findById(id);
    }
    async createRole(data) {
        // Filter out fields that don't exist in the Prisma schema
        const { description, permissions, createdAt, updatedAt, ...roleData } = data;
        return this.roleRepository.create(roleData);
    }
    async updateRole(id, data) {
        // Filter out fields that don't exist in the Prisma schema
        const { description, permissions, createdAt, updatedAt, ...roleData } = data;
        return this.roleRepository.update(id, roleData);
    }
    async duplicateRole(roleId) {
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
    async deleteRole(id) {
        return this.roleRepository.delete(id);
    }
    async countRoles(where = {}) {
        return this.roleRepository.count(where);
    }
}
