import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from '../domain/auth.repository.interface';
import { IHashingService } from '../../../core/domain/interfaces/hashing.interface';
import { LoginParams, LoginResult } from '../domain/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly hashingService: IHashingService,
    private readonly jwtService: JwtService,
  ) {}

  async login(params: LoginParams): Promise<LoginResult> {
    const user = await this.authRepository.findByEmail(params.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.hashingService.compare(params.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      role: user.role,
      userId: user.id,
      name: user.name,
    };
  }
}
