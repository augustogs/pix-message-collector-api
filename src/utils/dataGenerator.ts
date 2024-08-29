import { v4 as uuidv4 } from 'uuid';
import { PixMessage } from '../models/pixMessage';

export function generateRandomPixMessages(ispb: string, number: number): PixMessage[] {
  const messages: PixMessage[] = [];

  for (let i = 0; i < number; i++) {
    const message: PixMessage = {
      endToEndId: generateId(),
      valor: parseFloat((Math.random() * 1000).toFixed(2)),
      pagador: {
        nome: generateRandomName(),
        cpfCnpj: generateRandomCPF(),
        ispb: generateRandomISPB(),
        agencia: generateRandomAgency(),
        contaTransacional: generateRandomAccountNumber(),
        tipoConta: generateRandomAccountType()
      },
      recebedor: {
        nome: generateRandomName(),
        cpfCnpj: generateRandomCPF(),
        ispb: ispb,
        agencia: generateRandomAgency(),
        contaTransacional: generateRandomAccountNumber(),
        tipoConta: generateRandomAccountType()
      },
      campoLivre: '',
      txId: generateId(),
      dataHoraPagamento: new Date().toISOString()
    };

    messages.push(message);
  }

  return messages;
}

function generateId(): string {
  return uuidv4().replace(/-/g, '');
}

function generateRandomCPF(): string {
  const cpf = '1234567890'.split('').sort(() => Math.random() - 0.5).join('').slice(0, 11);
  return cpf;
}

function generateRandomISPB(): string {
  return '01234567'.split('').sort(() => Math.random() - 0.5).join('').slice(0, 8);
}

function generateRandomName(): string {
  const names = ['Marcos José', 'Flavio José', 'Ana Maria', 'Augusto Gomes', 'Gomes dos Santos'];
  return names[Math.floor(Math.random() * names.length)];
}

function generateRandomAgency(): string {
  return ('0000' + Math.floor(Math.random() * 10000)).slice(-4);
}

function generateRandomAccountNumber(): string {
  return ('00000000' + Math.floor(Math.random() * 10000000)).slice(-8);
}

function generateRandomAccountType(): string {
  const types = ['CACC', 'SVGS'];
  return types[Math.floor(Math.random() * types.length)];
}

