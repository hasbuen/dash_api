import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TicketsDTO } from './tickets.dto/ticket.dto';
import { obter } from '../util/redisConfig';
import { PrismaService } from 'src/database/PrismaService';

@Injectable()
export class ArmazenamentoService {

    private readonly logger = new Logger(ArmazenamentoService.name)

    constructor(private prisma: PrismaService) { }

    async guardarNovoTicket() {
        try {
            let ticketsEmCache = await obter('TicketsEmCache');

            if (typeof ticketsEmCache === 'string') {
                ticketsEmCache = JSON.parse(ticketsEmCache);
            }

            for (const separado of ticketsEmCache) {
                const data: TicketsDTO = {
                    TicketID: separado.TicketID,
                    Owner: separado.Owner,
                    State: separado.State,
                    TicketNumber: separado.TicketNumber,
                    Created: separado.Created,
                    Changed: separado.Changed
                };

                const ticketJaArmazenado = await this.prisma.ticket.findFirst({
                    where: {
                        TicketID: data.TicketID
                    }
                });

                if (ticketJaArmazenado) {
                    this.logger.warn(`Ticket ${data.TicketNumber} já está armazenado.`);
                } else {
                    await this.prisma.ticket.create({
                        data
                    });

                    this.logger.log(`Novo ticket armazenado em SQLite com sucesso: ${data.TicketNumber}`);
                }
            }

            return `Armazenados no SQLite: total de ${ticketsEmCache.length} tickets`;
        } catch (error) {
            this.logger.error('Erro ao tentar armazenar novo ticket: ' + error);
            throw error; // Rejogue a exceção para que o caller saiba que algo deu errado.
        }
    }


    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleCron() {
        try {
            await this.guardarNovoTicket();
            this.logger.log('Tickets em memória física com o SQLite, em ' + new Date());
        } catch (error) {
            this.logger.error('Erro ao tentar armazenar novos tickets: ' + error);
        }
    }

    async onApplicationBootstrap() {
        await this.guardarNovoTicket();
    }

}
