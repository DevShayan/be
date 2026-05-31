import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';

@Injectable()
export abstract class IAuthRepository {
  abstract findByEmail(email: string): Promise<{ id: string; email: string; password: string; name: string; role: string } | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
}
