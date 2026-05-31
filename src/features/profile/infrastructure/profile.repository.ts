import { Injectable } from '@nestjs/common';
import { prisma } from '../../../prisma/prisma.service';
import { IProfileRepository } from '../domain/profile.repository.interface';

@Injectable()
export class ProfileRepository implements IProfileRepository {

  async getProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true, email: true },
    });
  }
}
