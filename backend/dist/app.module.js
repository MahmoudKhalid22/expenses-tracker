"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const entities_1 = require("./entities");
const auth_1 = require("./auth");
const budget_1 = require("./budget");
const entities = [entities_1.User, entities_1.Category, entities_1.Expense, entities_1.MonthIncome];
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({ type: 'postgres', url: process.env.DATABASE_URL, entities, synchronize: true }),
            typeorm_1.TypeOrmModule.forFeature(entities),
            jwt_1.JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'dev', signOptions: { expiresIn: '7d' } }),
        ],
        controllers: [auth_1.AuthController, budget_1.BudgetController],
        providers: [auth_1.AuthGuard],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map