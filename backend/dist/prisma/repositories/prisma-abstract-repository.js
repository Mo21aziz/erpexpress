import { parseFilters, parseJoin, parseSelect, parseSort, } from "../utilities/query-params-parser";
export class BaseRepository {
    prisma;
    model;
    constructor(model, prisma) {
        this.model = model;
        this.prisma = prisma;
    }
    async findPaginated(queryObject, options = {}, supportSoftDelete = false) {
        const { filter, sort, size = options.DEFAULT_LIMIT || "10", page = "1", fields, join, search, } = queryObject;
        let where = parseFilters(filter, options, search, await this.getFields());
        const orderBy = parseSort(sort);
        const take = parseInt(size, 10);
        const skip = (parseInt(page, 10) - 1) * take;
        const select = parseSelect(fields);
        const include = parseJoin(join);
        const [data, itemCount] = await Promise.all([
            this.model.findMany({
                where,
                orderBy,
                skip,
                take,
                select,
                include,
            }),
            this.model.count({ where }),
        ]);
        const parsedPage = parseInt(page) || 0;
        return {
            data,
            meta: {
                itemCount,
                page: parsedPage,
                take,
                hasPreviousPage: parsedPage > 1,
                hasNextPage: itemCount > take * parsedPage,
                pageCount: Math.ceil(itemCount / take),
            },
        };
    }
    async findAll(supportSoftDelete = false) {
        return this.model.findMany();
    }
    async findByCondition(queryObject, options = {}, supportSoftDelete = false) {
        const { filter, sort, fields, join, search } = queryObject;
        let where = parseFilters(filter, options, search, await this.getFields());
        const orderBy = parseSort(sort);
        const select = parseSelect(fields);
        const include = parseJoin(join);
        return this.model.findMany({
            where,
            orderBy,
            select,
            include,
        });
    }
    async findOneByCondition(queryObject, options = {}, supportSoftDelete = false) {
        const models = await this.findByCondition(queryObject, options, supportSoftDelete);
        return models.length > 0 ? models[0] : null;
    }
    async findById(id, supportSoftDelete = false) {
        return this.model.findUnique({ where: { id } });
    }
    async create(data) {
        return this.model.create({ data });
    }
    async createMany(data) {
        return this.model.createMany({ data });
    }
    async update(id, data) {
        // Remove role_id if present (for User/Role models)
        const { role_id, ...rest } = data;
        return this.model.update({
            where: { id },
            data: {
                ...rest,
                ...(role_id ? { role: { connect: { id: role_id } } } : {}),
            },
        });
    }
    async updateAssociations({ existingItems, updatedItems, keys, onDelete, onCreate, }) {
        const newItems = [];
        const keptItems = [];
        const eliminatedItems = [];
        const [key1, key2] = keys;
        const isSameCombination = (a, b) => a[key1] === b[key1] && a[key2] === b[key2];
        for (const existingItem of existingItems) {
            const existsInUpdate = updatedItems.some((updatedItem) => isSameCombination(updatedItem, existingItem));
            if (!existsInUpdate) {
                eliminatedItems.push(await onDelete(existingItem.id));
            }
            else {
                keptItems.push(existingItem);
            }
        }
        for (const updatedItem of updatedItems) {
            const existsInExisting = existingItems.some((existingItem) => isSameCombination(updatedItem, existingItem));
            if (!existsInExisting) {
                newItems.push(await onCreate(updatedItem));
            }
        }
        return {
            keptItems,
            newItems,
            eliminatedItems,
        };
    }
    async softDelete(id) {
        return this.model.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async softDeleteMany(ids) {
        return this.model.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date() },
        });
    }
    async restore(id) {
        return this.model.update({
            where: { id },
            data: { deletedAt: null },
        });
    }
    async restoreMany(ids) {
        return this.model.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: null },
        });
    }
    async delete(id) {
        // Use hard delete for User and Role (no deletedAt field)
        return this.model.delete({
            where: { id },
        });
    }
    async deleteMany(ids) {
        return this.model.deleteMany({ where: { id: { in: ids } } });
    }
    async count(where = {}) {
        return this.model.count({ where });
    }
    async getFields() {
        const record = await this.model.findFirst();
        if (!record) {
            return [];
        }
        return Object.keys(record).filter((key) => typeof record[key] === "string");
    }
}
