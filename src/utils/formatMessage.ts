interface Pagador {
    nome: string;
    cpfCnpj: string;
    ispb: string;
    agencia: string;
    contaTransacional: string;
    tipoConta: string;
  }
  
  interface Recebedor {
    nome: string;
    cpfCnpj: string;
    ispb: string;
    agencia: string;
    contaTransacional: string;
    tipoConta: string;
  }
  
  interface MessageResponse {
    endToEndId: string;
    valor: string;
    pagador: Pagador;
    recebedor: Recebedor;
    campoLivre: string;
    txId: string;
    dataHoraPagamento: string;
  }

export const formatMessage = (msg: any): MessageResponse => ({
    endToEndId: msg.end_to_end_id,
    valor: msg.valor,
    pagador: {
      nome: msg.pagador_nome,
      cpfCnpj: msg.pagador_cpf_cnpj,
      ispb: msg.pagador_ispb,
      agencia: msg.pagador_agencia,
      contaTransacional: msg.pagador_conta_transacional,
      tipoConta: msg.pagador_tipo_conta
    },
    recebedor: {
      nome: msg.recebedor_nome,
      cpfCnpj: msg.recebedor_cpf_cnpj,
      ispb: msg.recebedor_ispb,
      agencia: msg.recebedor_agencia,
      contaTransacional: msg.recebedor_conta_transacional,
      tipoConta: msg.recebedor_tipo_conta
    },
    campoLivre: msg.campo_livre,
    txId: msg.tx_id,
    dataHoraPagamento: msg.data_hora_pagamento
  });