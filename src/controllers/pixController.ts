import { Request, Response } from 'express';
import { insertPixMessages, getPixMessages, logInteraction, getPixMessagesByInteractionId, checkStreamLimit, registerStream, finalizeStream } from '../services/pixService';
import { generateId } from '../utils/dataGenerator';
import { formatMessage } from '../utils/formatMessage';

const MAX_WAIT_TIME = 8000;
const POLLING_INTERVAL = 5000;

export const postMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ispb, number } = req.params;
    const numMessages = parseInt(number, 10);

    if (isNaN(numMessages) || numMessages <= 0) {
      res.status(400).json({ error: 'Invalid number of messages' });
      return;
    }

    const result = await insertPixMessages(ispb, numMessages);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const contentType = req.headers['content-type'];
  const { ispb } = req.params;
  const limit = (contentType === 'multipart/json') ? 10 : 1;
  const interaction_id = generateId();
  const startTime = Date.now();
  
  try {
    const canStartStream = await checkStreamLimit(ispb);
    if (!canStartStream) {
      res.status(429).json({ error: 'Too many collectors for this ISPB' });
      return;
    }

    await registerStream(ispb, interaction_id);
    
    while (Date.now() - startTime < MAX_WAIT_TIME) {
      const messages = await getPixMessages(ispb, limit, interaction_id);
      
      if (messages.length > 0) {
        await logInteraction(interaction_id, ispb, messages.map(msg => msg.endToEndId));
        const pullNextUri = `/api/pix/${ispb}/stream/${interaction_id}`;
        res.setHeader('Pull-Next', pullNextUri);

        const formattedMessages = messages.map(formatMessage);

        if (!contentType || contentType === 'application/json') {
          res.status(200).json(formattedMessages[0] || {});
        } else if (contentType === 'multipart/json') {
          res.status(200).json(formattedMessages);
        }
        return;
      }
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL)); 
    }

    const pullNextUri = `/api/pix/${ispb}/stream/${interaction_id}`;
    res.setHeader('Pull-Next', pullNextUri);
    res.status(204).end();

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessagesByInteractionId = async (req: Request, res: Response): Promise<void> => {
  const contentType = req.headers['content-type'];
  const { ispb, interationId } = req.params;
  const limit = (contentType === 'multipart/json') ? 10 : 1;
  const startTime = Date.now();

  try {
    while (Date.now() - startTime < MAX_WAIT_TIME) {
      const messages = await getPixMessagesByInteractionId(ispb, limit, interationId);

      if (messages.newMessages.length > 0) {
        const pullNextUri = `/api/pix/${ispb}/stream/${messages.nextInteractionId}`;
        res.setHeader('Pull-Next', pullNextUri);
        
        const formattedMessages = messages.newMessages.map(formatMessage);

        if (!contentType || contentType === 'application/json') {
          res.status(200).json(formattedMessages[0] || {});
        } else if (contentType === 'multipart/json') {
          res.status(200).json(formattedMessages);
        }
        return;
      }
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL)); 
    }

    const pullNextUri = `/api/pix/${ispb}/stream/${interationId}`;
    res.setHeader('Pull-Next', pullNextUri);
    res.status(204).end();
  } catch (error) {  
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const deleteStream = async (req: Request, res: Response): Promise<void> => {
  const { ispb, interationId } = req.params;
  
  try {
    await finalizeStream(ispb, interationId);
    res.status(200).json({ message: 'Stream finalized successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};