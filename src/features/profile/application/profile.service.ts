import { Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from '../domain/profile.repository.interface';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async getProfile(userId: string) {
    const user = await this.profileRepository.getProfile(userId);
    if (!user) throw new NotFoundException('User not found');

    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    };
  }
}
