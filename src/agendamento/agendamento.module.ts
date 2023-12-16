
import { Module } from '@nestjs/common';
import { AgendamentoService } from './agendamento.service';
import { SessaoModule } from './sessao/sessao.module';

@Module({
  providers: [
    AgendamentoService, 
  ],
  imports: [SessaoModule],
})
export class AgendamentoModule {}