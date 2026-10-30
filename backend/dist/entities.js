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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = exports.Category = exports.MonthIncome = exports.User = void 0;
const typeorm_1 = require("typeorm");
const num = { to: (v) => v, from: (v) => parseFloat(v) };
const money = { type: 'numeric', precision: 12, scale: 2, transformer: num };
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
let MonthIncome = class MonthIncome {
};
exports.MonthIncome = MonthIncome;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MonthIncome.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MonthIncome.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MonthIncome.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)({ ...money, default: 0 }),
    __metadata("design:type", Number)
], MonthIncome.prototype, "income", void 0);
exports.MonthIncome = MonthIncome = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['userId', 'month'])
], MonthIncome);
let Category = class Category {
};
exports.Category = Category;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Category.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Category.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Category.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ ...money, default: 0 }),
    __metadata("design:type", Number)
], Category.prototype, "budget", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Expense, (e) => e.category),
    __metadata("design:type", Array)
], Category.prototype, "expenses", void 0);
exports.Category = Category = __decorate([
    (0, typeorm_1.Entity)()
], Category);
let Expense = class Expense {
};
exports.Expense = Expense;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Expense.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Expense.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Category, (c) => c.expenses, { onDelete: 'CASCADE' }),
    __metadata("design:type", Category)
], Expense.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(money),
    __metadata("design:type", Number)
], Expense.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], Expense.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", String)
], Expense.prototype, "date", void 0);
exports.Expense = Expense = __decorate([
    (0, typeorm_1.Entity)()
], Expense);
//# sourceMappingURL=entities.js.map