import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class IHashingService {
  abstract hash(data: string): Promise<string>;
  abstract compare(data: string, encrypted: string): Promise<boolean>;
}
