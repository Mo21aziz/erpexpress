import { BaseRepository } from "../../../prisma/repositories/prisma-abstract-repository";
export class CategoryRepository extends BaseRepository {
    constructor(prisma) {
        super(prisma.category, prisma);
    }
}
