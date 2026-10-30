"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_1 = require("./auth");
const entities_1 = require("./entities");
const amt = (v) => { const n = Number(v); if (!isFinite(n) || n < 0)
    throw new common_1.BadRequestException('مبلغ غير صالح'); return n; };
let BudgetController = class BudgetController {
    constructor(cats, exps, inc) {
        this.cats = cats;
        this.exps = exps;
        this.inc = inc;
    }
    async own(id, userId) {
        const c = await this.cats.findOneBy({ id, userId });
        if (!c)
            throw new common_1.NotFoundException();
        return c;
    }
    async summary(r, m) {
        const uid = r.user.id;
        const income = (await this.inc.findOneBy({ userId: uid, month: m }))?.income ?? 0;
        const cats = await this.cats.find({ where: { userId: uid, month: m }, relations: { expenses: true }, order: { id: 'ASC' } });
        const categories = cats.map((c) => {
            const spent = c.expenses.reduce((s, e) => s + e.amount, 0);
            return { id: c.id, name: c.name, budget: c.budget, spent, remaining: c.budget - spent,
                expenses: c.expenses.sort((a, b) => b.id - a.id) };
        });
        const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
        const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
        return { month: m, income, categories, totalBudget, totalSpent, unallocated: income - totalBudget, balance: income - totalSpent };
    }
    async setIncome(r, m, v) {
        const userId = r.user.id;
        const row = (await this.inc.findOneBy({ userId, month: m })) ?? this.inc.create({ userId, month: m });
        row.income = amt(v);
        return this.inc.save(row);
    }
    async copy(r, m, from) {
        const userId = r.user.id;
        const prev = await this.cats.findBy({ userId, month: from });
        const old = await this.inc.findOneBy({ userId, month: from });
        if (old && !(await this.inc.findOneBy({ userId, month: m })))
            await this.inc.save({ userId, month: m, income: old.income });
        await this.cats.save(prev.map((c) => ({ userId, month: m, name: c.name, budget: c.budget })));
        return { copied: prev.length };
    }
    create(r, b) {
        if (!b.name?.trim() || !b.month)
            throw new common_1.BadRequestException();
        return this.cats.save({ userId: r.user.id, month: b.month, name: b.name.trim(), budget: amt(b.budget) });
    }
    async update(r, id, b) {
        const c = await this.own(+id, r.user.id);
        if (b.name?.trim())
            c.name = b.name.trim();
        if (b.budget !== undefined)
            c.budget = amt(b.budget);
        return this.cats.save(c);
    }
    async remove(r, id) {
        await this.own(+id, r.user.id);
        await this.cats.delete(+id);
        return { ok: true };
    }
    async addExpense(r, b) {
        await this.own(b.categoryId, r.user.id);
        return this.exps.save({ categoryId: b.categoryId, amount: amt(b.amount), note: b.note ?? '', ...(b.date ? { date: b.date } : {}) });
    }
    async delExpense(r, id) {
        const e = await this.exps.findOneBy({ id: +id });
        if (!e)
            throw new common_1.NotFoundException();
        await this.own(e.categoryId, r.user.id);
        await this.exps.delete(e.id);
        return { ok: true };
    }
};
exports.BudgetController = BudgetController;
__decorate([
    (0, common_1.Get)('months/:m/summary'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('m')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "summary", null);
__decorate([
    (0, common_1.Put)('months/:m/income'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('m')),
    __param(2, (0, common_1.Body)('income')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "setIncome", null);
__decorate([
    (0, common_1.Post)('months/:m/copy-from/:from'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('m')),
    __param(2, (0, common_1.Param)('from')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "copy", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('expenses'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "addExpense", null);
__decorate([
    (0, common_1.Delete)('expenses/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BudgetController.prototype, "delExpense", null);
exports.BudgetController = BudgetController = __decorate([
    (0, common_1.UseGuards)(auth_1.AuthGuard),
    (0, common_1.Controller)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Expense)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.MonthIncome)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BudgetController);
//# sourceMappingURL=budget.js.map