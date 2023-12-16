import { Module } from '@nestjs/common';
import { ArmazenamentoService } from './armazenamento.service';
import { PrismaService } from 'src/database/PrismaService';

@Module({
  providers: [
    ArmazenamentoService,
    PrismaService
  ],
})
export class ArmazenamentoModule {}
