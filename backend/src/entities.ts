import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
const num = { to: (v: number) => v, from: (v: string) => parseFloat(v) };
const money = { type: 'numeric' as const, precision: 12, scale: 2, transformer: num };

@Entity() export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) email: string;
  @Column() password: string;
}
@Entity() @Unique(['userId', 'month']) export class MonthIncome {
  @PrimaryGeneratedColumn() id: number;
  @Column() userId: number;
  @Column() month: string; // YYYY-MM
  @Column({ ...money, default: 0 }) income: number;
}
@Entity() export class Category {
  @PrimaryGeneratedColumn() id: number;
  @Column() userId: number;
  @Column() month: string;
  @Column() name: string;
  @Column({ ...money, default: 0 }) budget: number;
  @OneToMany(() => Expense, (e) => e.category) expenses: Expense[];
}
@Entity() export class Expense {
  @PrimaryGeneratedColumn() id: number;
  @Column() categoryId: number;
  @ManyToOne(() => Category, (c) => c.expenses, { onDelete: 'CASCADE' }) category: Category;
  @Column(money) amount: number;
  @Column({ default: '' }) note: string;
  @Column({ type: 'date', default: () => 'CURRENT_DATE' }) date: string;
}
