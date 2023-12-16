import Redis from "ioredis";
import { promisify } from "util";


const cliente = new Redis();

function obter(valor: string) {
    const sync = promisify(cliente.get).bind(cliente)
    return sync(valor)
}

function definir(chave: string, valor: string) {
    const sync = promisify(cliente.set).bind(cliente)
    return sync(chave, valor)
}

export { cliente, obter, definir };
