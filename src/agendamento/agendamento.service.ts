import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserDTO } from './user.dto/user.dto';
import { definir, obter } from '../util/redisConfig';
import dateTimeFormatted from '../util/dateTimeFormatted';

@Injectable()
export class AgendamentoService implements OnApplicationBootstrap {

  private readonly logger = new Logger(AgendamentoService.name)

  constructor() { }

  async obterTickets(): Promise<void> {
    const tickets = [];

    try {
      const autenticacao: UserDTO = {
        UserLogin: process.env.API_USER,
        Password: process.env.API_PASS,
      };

      const session = await obter('SessionID');
      let ticketsIDsObtidosEmCache = await obter('TicketIDs');
      const dateFilterParam = dateTimeFormatted();
      //const dateFilterParam = '2023-09-01 08:00:00'

      const urlParaBuscarIDsDeTickets = `${process.env.API_HOST}/otrs/nph-genericinterface.pl/Webservice/Dashboard/TicketSearch?SessionID=${session}&QueueIDs=${process.env.API_SETOR}&TicketCreateTimeNewerDate=${dateFilterParam}`;
      //const urlParaBuscarIDsDeTickets = `${process.env.API_HOST}/otrs/nph-genericinterface.pl/Webservice/Dashboard/TicketSearch?SessionID=${session}&TicketCreateTimeNewerDate=${dateFilterParam}`;
      const obtiveIDs = await fetch(urlParaBuscarIDsDeTickets);

      if (!obtiveIDs.ok) {
        throw new Error(`Não foi possível obter TicketIDs, Status: ${obtiveIDs.status}`);
      }

      const ticketsIDsObtidos = await obtiveIDs.json();

      if (!ticketsIDsObtidosEmCache) {
        await definir('TicketIDs', ticketsIDsObtidos.TicketID.join(','));
      } else {
        for (const ticketRecepcionado of ticketsIDsObtidos.TicketID) {
          const isTicketInCache = ticketsIDsObtidosEmCache.includes(ticketRecepcionado.toString().trim());

          if (!isTicketInCache) {
            await definir('TicketIDs', ticketsIDsObtidos.TicketID.join(','));
          }
        }
      }

      if (Array.isArray(ticketsIDsObtidos.TicketID)) {
        for (const ticketID of ticketsIDsObtidos.TicketID) {
          const urlParaBuscarDetalhesDoTicket = `${process.env.API_HOST}/otrs/nph-genericinterface.pl/Webservice/${process.env.API_WS}/Ticket/${ticketID}`;
          const body = JSON.stringify(autenticacao);

          const ticketDetalhado = await fetch(urlParaBuscarDetalhesDoTicket, {
            method: 'POST',
            body: body,
          });

          if (!ticketDetalhado.ok) {
            throw new Error(`Não foi possível obter o detalhamento do ticket, Status: ${ticketDetalhado.status}`);
          }

          const detalheObtido = await ticketDetalhado.json();
          const detalhamentoDoTicket = detalheObtido.Ticket[0];

          if (detalhamentoDoTicket.Owner.toLowerCase() !== 'root@localhost') {
            tickets.push({
              TicketID: detalhamentoDoTicket.TicketID.toString(),
              Owner: detalhamentoDoTicket.Owner,
              State: detalhamentoDoTicket.State,
              TicketNumber: detalhamentoDoTicket.TicketNumber,
              Created: detalhamentoDoTicket.Created,
              Changed: detalhamentoDoTicket.Changed
            });
          }
        }
      }

      await definir('TicketsEmCache', JSON.stringify(tickets));

    } catch (error) {
      this.logger.error(error.message || 'Erro ao obter tickets.');
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    try {
      await this.obterTickets();
      this.logger.log('Novos tickets foram obtidos, em ' + new Date());

    } catch (error) {
      this.logger.error('Erro ao obter novos tickets: ' + (error.message || error));
    }
  }

  async onApplicationBootstrap() {
    await this.obterTickets();
  }
}
