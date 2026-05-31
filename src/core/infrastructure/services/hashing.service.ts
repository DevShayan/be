import * as bcrypt from 'bcrypt';
import { IHashingService } from '../../domain/interfaces/hashing.interface';

export class HashingService extends IHashingService {
  private readonly saltRounds = 10;

  async hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.saltRounds);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
