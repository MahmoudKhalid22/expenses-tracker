import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User, Category, Expense, MonthIncome } from './entities';
import { AuthController, AuthGuard } from './auth';
import { BudgetController } from './budget';

const entities = [User, Category, Expense, MonthIncome];
@Module({
  imports: [
    TypeOrmModule.forRoot({ type: 'postgres', url: process.env.DATABASE_URL, entities, synchronize: true }),
    TypeOrmModule.forFeature(entities),
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'dev', signOptions: { expiresIn: '7d' } }),
  ],
  controllers: [AuthController, BudgetController],
  providers: [AuthGuard],
})
export class AppModule {}
