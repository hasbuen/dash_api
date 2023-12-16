import { Module, Logger, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgendamentoModule } from './agendamento/agendamento.module';
import { ArmazenamentoModule } from './armazenamento/armazenamento.module';
import * as cors from 'cors';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    ScheduleModule.forRoot(),
    AgendamentoModule, 
    ArmazenamentoModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger
  ], 
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cors({
      origin: '*', 
      methods: 'GET',
      credentials: true,
    })).forRoutes('*');
  }
}
