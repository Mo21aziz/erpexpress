"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const prisma_abstract_repository_1 = require("../../../prisma/repositories/prisma-abstract-repository");
class RoleRepository extends prisma_abstract_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma.role, prisma);
    }
}
exports.RoleRepository = RoleRepository;
