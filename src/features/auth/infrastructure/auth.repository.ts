import { Injectable } from '@nestjs/common';
import { prisma } from '../../../prisma/prisma.service';
import { IAuthRepository } from '../domain/auth.repository.interface';
import { UserEntity } from '../domain/entities/user.entity';

@Injectable()
export class AuthRepository implements IAuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, name: true, role: true },
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new UserEntity(user.id, user.email, user.name, user.role, user.program);
  }
}
