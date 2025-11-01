"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const prisma_abstract_repository_1 = require("../../../prisma/repositories/prisma-abstract-repository");
class CategoryRepository extends prisma_abstract_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma.category, prisma);
    }
}
exports.CategoryRepository = CategoryRepository;
