import { Injectable } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { obter } from './util/redisConfig';

@Injectable()
export class AppService {

  constructor() { }

  tickets(): Observable<any> {
    return from(
      (async () => {
        try {
          return await obter('TicketsEmCache');

        } catch (error) {
          console.error(`Erro na resposta da requisição: ${error}`);
          return [];
        }
      })()
    );
  }
}