import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ConflictException, Controller, Post, Body } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities';

@Injectable() export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(c: ExecutionContext) {
    const r = c.switchToHttp().getRequest();
    try { r.user = this.jwt.verify((r.headers.authorization || '').replace('Bearer ', '')); return true; }
    catch { throw new UnauthorizedException(); }
  }
}

@Controller('auth') export class AuthController {
  constructor(@InjectRepository(User) private users: Repository<User>, private jwt: JwtService) {}
  private token(u: User) { return { token: this.jwt.sign({ id: u.id }), email: u.email }; }
  @Post('register') async register(@Body() b: { email: string; password: string }) {
    if (!b.email || (b.password || '').length < 6) throw new UnauthorizedException('بيانات غير صالحة');
    if (await this.users.findOneBy({ email: b.email })) throw new ConflictException('الإيميل مسجل');
    return this.token(await this.users.save({ email: b.email, password: await bcrypt.hash(b.password, 10) }));
  }
  @Post('login') async login(@Body() b: { email: string; password: string }) {
    const u = await this.users.findOneBy({ email: b.email });
    if (!u || !(await bcrypt.compare(b.password, u.password))) throw new UnauthorizedException('بيانات الدخول غلط');
    return this.token(u);
  }
}
