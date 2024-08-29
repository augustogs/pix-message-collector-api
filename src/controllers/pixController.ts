import { Request, Response } from 'express';
import { insertPixMessages, getPixMessages } from '../services/pixService';

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

  try {
    const { ispb } = req.params;
    const messages = await getPixMessages(ispb);

    if (!contentType || contentType === 'application/json') {
      res.status(200).json(messages[0]);
    }

    if (contentType === 'multipart/json') {
      res.status(200).json(messages);
    }

  } catch (error) {
    res.status(204).json({ error : 'Internal server error' });
  }
}