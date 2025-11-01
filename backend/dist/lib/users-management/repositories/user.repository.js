import { BaseRepository } from "../../../prisma/repositories/prisma-abstract-repository";
export class UserRepository extends BaseRepository {
    constructor(prisma) {
        super(prisma.user, prisma);
    }
    async findByEmail(email) {
        return this.model.findUnique({
            where: { email },
            include: {
                role: true,
                employee: true,
                admin: true,
            },
        });
    }
    async create(data) {
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
    async update(id, data) {
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
