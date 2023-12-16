export default function dateTimeFormatted(): string {
    const dataAtual = new Date();
    dataAtual.setDate(dataAtual.getDate() - 1);

    // Formata a data para o formato desejado (YYYY-MM-DD HH:mm:ss).
    const dia = dataAtual.getDate().toString().padStart(2, '0');
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataAtual.getFullYear();
    const horas = dataAtual.getHours().toString().padStart(2, '0');
    const minutos = dataAtual.getMinutes().toString().padStart(2, '0');
    const segundos = dataAtual.getSeconds().toString().padStart(2, '0');

    return `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}
