import { Router } from 'express';
import { postMessages, getMessages, getMessagesByInteractionId, deleteStream } from '../controllers/pixController';

const router = Router();

router.post('/msgs/:ispb/:number', postMessages);

router.get('/:ispb/stream/start', getMessages);

router.get('/:ispb/stream/:interationId', getMessagesByInteractionId);

router.delete('/:ispb/stream/:interationId', deleteStream);

export default router;
