import { Global, Module } from '@nestjs/common';
import { IHashingService } from '../../domain/interfaces/hashing.interface';
import { HashingService } from './hashing.service';

@Global()
@Module({
  providers: [{ provide: IHashingService, useClass: HashingService }],
  exports: [IHashingService],
})
export class HashingServiceModule {}
