import { Module } from '@nestjs/common';
import { SessaoService } from './sessao.service';

@Module({
  providers: [SessaoService],
})
export class SessaoModule {}
