import { Pool } from 'pg';
import { PixMessage } from '../models/pixMessage';
import { generateRandomPixMessages } from '../utils/dataGenerator';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const insertPixMessages = async (ispb: string, number: number): Promise<PixMessage[]> => {
  const messages: PixMessage[] = generateRandomPixMessages(ispb, number);

  try {
    const client = await pool.connect();

    await client.query('BEGIN');

    for (const message of messages) {
      await client.query(
        `INSERT INTO pix_messages (
          end_to_end_id, valor, pagador_nome, pagador_cpf_cnpj, pagador_ispb, 
          pagador_agencia, pagador_conta_transacional, pagador_tipo_conta, 
          recebedor_nome, recebedor_cpf_cnpj, recebedor_ispb, recebedor_agencia, 
          recebedor_conta_transacional, recebedor_tipo_conta, campo_livre, 
          tx_id, data_hora_pagamento
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )`,
        [
          message.endToEndId,
          message.valor,
          message.pagador.nome,
          message.pagador.cpfCnpj,
          message.pagador.ispb,
          message.pagador.agencia,
          message.pagador.contaTransacional,
          message.pagador.tipoConta,
          message.recebedor.nome,
          message.recebedor.cpfCnpj,
          message.recebedor.ispb,
          message.recebedor.agencia,
          message.recebedor.contaTransacional,
          message.recebedor.tipoConta,
          message.campoLivre,
          message.txId,
          message.dataHoraPagamento
        ]
      );
    }

    await client.query('COMMIT');
    client.release();
  } catch (error) {
    console.error('Error inserting messages', error);
    throw error;
  }

  return messages;
};

export const getPixMessages = async (ispb: string): Promise<PixMessage[]> => {
  const client = await pool.connect();

  await client.query('BEGIN');

  const res = await client.query(`SELECT * FROM pix_messages WHERE recebedor_ispb = $1`, [ispb]);

  return res.rows;
}