import { Controller, Get, Put, Post, Patch, Delete, Param, Body, Req, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from './auth';
import { Category, Expense, MonthIncome } from './entities';

const amt = (v: any) => { const n = Number(v); if (!isFinite(n) || n < 0) throw new BadRequestException('مبلغ غير صالح'); return n; };

@UseGuards(AuthGuard) @Controller()
export class BudgetController {
  constructor(
    @InjectRepository(Category) private cats: Repository<Category>,
    @InjectRepository(Expense) private exps: Repository<Expense>,
    @InjectRepository(MonthIncome) private inc: Repository<MonthIncome>,
  ) {}

  private async own(id: number, userId: number) {
    const c = await this.cats.findOneBy({ id, userId });
    if (!c) throw new NotFoundException();
    return c;
  }

  @Get('months/:m/summary') async summary(@Req() r, @Param('m') m: string) {
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

  @Put('months/:m/income') async setIncome(@Req() r, @Param('m') m: string, @Body('income') v: number) {
    const userId = r.user.id; const row = (await this.inc.findOneBy({ userId, month: m })) ?? this.inc.create({ userId, month: m });
    row.income = amt(v); return this.inc.save(row);
  }

  @Post('months/:m/copy-from/:from') async copy(@Req() r, @Param('m') m: string, @Param('from') from: string) {
    const userId = r.user.id;
    const prev = await this.cats.findBy({ userId, month: from });
    const old = await this.inc.findOneBy({ userId, month: from });
    if (old && !(await this.inc.findOneBy({ userId, month: m }))) await this.inc.save({ userId, month: m, income: old.income });
    await this.cats.save(prev.map((c) => ({ userId, month: m, name: c.name, budget: c.budget })));
    return { copied: prev.length };
  }

  @Post('categories') create(@Req() r, @Body() b: { month: string; name: string; budget: number }) {
    if (!b.name?.trim() || !b.month) throw new BadRequestException();
    return this.cats.save({ userId: r.user.id, month: b.month, name: b.name.trim(), budget: amt(b.budget) });
  }
  @Patch('categories/:id') async update(@Req() r, @Param('id') id: string, @Body() b: { name?: string; budget?: number }) {
    const c = await this.own(+id, r.user.id);
    if (b.name?.trim()) c.name = b.name.trim();
    if (b.budget !== undefined) c.budget = amt(b.budget);
    return this.cats.save(c);
  }
  @Delete('categories/:id') async remove(@Req() r, @Param('id') id: string) {
    await this.own(+id, r.user.id); await this.cats.delete(+id); return { ok: true };
  }

  @Post('expenses') async addExpense(@Req() r, @Body() b: { categoryId: number; amount: number; note?: string; date?: string }) {
    await this.own(b.categoryId, r.user.id);
    return this.exps.save({ categoryId: b.categoryId, amount: amt(b.amount), note: b.note ?? '', ...(b.date ? { date: b.date } : {}) });
  }
  @Delete('expenses/:id') async delExpense(@Req() r, @Param('id') id: string) {
    const e = await this.exps.findOneBy({ id: +id }); if (!e) throw new NotFoundException();
    await this.own(e.categoryId, r.user.id); await this.exps.delete(e.id); return { ok: true };
  }
}
