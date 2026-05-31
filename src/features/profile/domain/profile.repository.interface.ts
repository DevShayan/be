import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class IProfileRepository {
  abstract getProfile(userId: string): Promise<{ id: string; name: string; role: string; email: string } | null>;
}
