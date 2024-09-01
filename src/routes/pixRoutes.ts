import { Router } from 'express';
import { postMessages, getMessages, getMessagesByInteractionId, deleteStream } from '../controllers/pixController';

const router = Router();

router.post('/msgs/:ispb/:number', postMessages);

router.get('/:ispb/stream/start', getMessages);

router.get('/:ispb/stream/:interaction_id', getMessagesByInteractionId);

router.delete('/:ispb/stream/:interaction_id', deleteStream);

export default router;
