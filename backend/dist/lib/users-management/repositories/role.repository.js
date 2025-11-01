import { BaseRepository } from "../../../prisma/repositories/prisma-abstract-repository";
export class RoleRepository extends BaseRepository {
    constructor(prisma) {
        super(prisma.role, prisma);
    }
}
