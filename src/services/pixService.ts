import { Pool } from 'pg';
import { PixMessage } from '../models/pixMessage';
import { PixMessageResponse } from '../models/pixMessageResponse';
import { generateRandomPixMessages, generateId } from '../utils/dataGenerator';

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

export const getPixMessages = async (ispb: string, limit: number): Promise<PixMessage[]> => {
  const query = `
    SELECT pm.end_to_end_id AS "endToEndId", pm.*
    FROM pix_messages pm
    WHERE pm.recebedor_ispb = $1
    LIMIT $2;
`;
  const values = [ispb, limit];
  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

export const getPixMessagesByInteractionId = async (ispb: string, limit: number, interaction_id: string): Promise<PixMessageResponse> => {
  const client = await pool.connect();
  
  try {
    const queryAllMessages = await client.query(`SELECT * FROM pix_messages where recebedor_ispb = $1`, [ispb]);
    const allMessages = queryAllMessages.rows;
  
    const queryLogInteraction =  await client.query(`SELECT message_ids FROM interaction_logs WHERE interaction_id = $1`, [interaction_id]);
    const messageIdsLog = queryLogInteraction.rows;
    
    const messageIds = messageIdsLog[0].message_ids;
  
    const newMessages = allMessages.filter(message => !messageIds.includes(message.end_to_end_id)).slice(0, limit);
    const newMessagesIds = newMessages.map(msg => msg.end_to_end_id);
  
    const messagesReturnedByInteraction = messageIds.concat(newMessagesIds);
  
    const nextInteractionId = generateId();
    await logInteraction(nextInteractionId, ispb, messagesReturnedByInteraction);
  
    return  {
      nextInteractionId,
      newMessages
    }; 
  } catch (error) {
    throw error;
  }
}


export const logInteraction = async (interactionId: string, ispb: string, messageIds: string[]): Promise<void> => {
  const query = `
    INSERT INTO interaction_logs (interaction_id, ispb, message_ids)
    VALUES ($1, $2, $3)
  `;

  const values = [interactionId, ispb, messageIds];
  const client = await pool.connect();
  try {
    await client.query(query, values);
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

export const registerStream = async (ispb: string, interaction_id: string): Promise<void> => {
  const query = `
    INSERT INTO active_streams (ispb, interaction_id)
    VALUES ($1, $2);
  `;
  const values = [ispb, interaction_id];
  const client = await pool.connect();
  
  try {
    await client.query(query, values);
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

export const checkStreamLimit = async (ispb: string): Promise<boolean> => {
  const query = `
    SELECT COUNT(*) AS active_count
    FROM active_streams
    WHERE ispb = $1 AND status = 'active';
  `;
  const values = [ispb];
  const client = await pool.connect();
  
  try {
    const result = await client.query(query, values);
    return parseInt(result.rows[0].active_count, 10) < 6;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

export const finalizeStream = async (ispb: string, interaction_id: string): Promise<void> => {
  const query = `
    UPDATE active_streams
    SET status = 'finished'
    WHERE ispb = $1 AND interaction_id = $2 AND status = 'active';
  `;
  const values = [ispb, interaction_id];
  const client = await pool.connect();

  try {
    await client.query(query, values);
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};
