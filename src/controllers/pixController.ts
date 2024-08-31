import { Request, Response } from 'express';
import { insertPixMessages, getPixMessages, logInteraction, getPixMessagesByInteractionId } from '../services/pixService';
import { generateId } from '../utils/dataGenerator';

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
  const limit = 10;

  try {
    const messages = await getPixMessages(ispb, limit);
    const interaction_id = generateId();

    await logInteraction(interaction_id, ispb, messages.map(msg => msg.endToEndId));

    const pullNextUri = `/api/pix/${ispb}/stream/${interaction_id}`;
    res.setHeader('Pull-Next', pullNextUri);

    if (!contentType || contentType === 'application/json') {
      res.status(200).json(messages[0] || {});
    } 
    
    if (contentType === 'multipart/json') {
      res.status(200).json(messages);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessagesByInteractionId = async (req: Request, res: Response): Promise<void> => {
  const contentType = req.headers['content-type'];
  const { ispb, interaction_id } = req.params;
  const limit = 10;

  try {
    const messages = await getPixMessagesByInteractionId(ispb, limit, interaction_id);

    const pullNextUri = `/api/pix/${ispb}/stream/${messages.nextInteractionId}`;
    res.setHeader('Pull-Next', pullNextUri);

    if (!contentType || contentType === 'application/json') {
      res.status(200).json(messages.newMessages[0] || {});
    }
    if (contentType === 'multipart/json') {
      res.status(200).json(messages);
    }
  } catch (error) {  
    res.status(500).json({ error: 'Internal server error' });
  }
}