import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserDTO } from '../user.dto/user.dto';
import { definir, obter } from '../../util/redisConfig';

@Injectable()
export class SessaoService {

    private readonly logger = new Logger(SessaoService.name)

    constructor() { }

    async criaNovaSessaoID(): Promise<void> {
        const urlParaCriarUmNovoHashParaSessao =
            `${process.env.API_HOST}/otrs/nph-genericinterface.pl/Webservice/${process.env.API_WS}/Session`;

        const data: UserDTO = {
            UserLogin: process.env.API_USER,
            Password: process.env.API_PASS,
        };

        try {

            const sessaoObtida = await fetch(urlParaCriarUmNovoHashParaSessao, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!sessaoObtida.ok) {
                throw new Error(`Erro na requisição! status: ${sessaoObtida.status}`);
            }

            const sessao = await sessaoObtida.json();

            await definir('SessionID', sessao["SessionID"].toString())

        } catch (error) {
            console.error(`Erro na sessao da requisição: ${error}`);
        }
    }

    @Cron(CronExpression.EVERY_8_HOURS)
    async handleCron() {
        try {
            
            await this.criaNovaSessaoID();

            this.logger.log(`Nova sessao obtida com sucesso [ ${await obter('SessionID')} ]`);

        } catch (error) {
            this.logger.error('Erro ao obter SessionID: ' + error);
        }
    }

    async onApplicationBootstrap() {
        await this.criaNovaSessaoID();
    }

}
