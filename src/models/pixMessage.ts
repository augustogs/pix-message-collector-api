export interface PixMessage {
  endToEndId: string;
  valor: number;
  pagador: {
    nome: string;
    cpfCnpj: string;
    ispb: string;
    agencia: string;
    contaTransacional: string;
    tipoConta: string;
  };
  recebedor: {
    nome: string;
    cpfCnpj: string;
    ispb: string;
    agencia: string;
    contaTransacional: string;
    tipoConta: string;
  };
  campoLivre: string;
  txId: string;
  dataHoraPagamento: string;
}
