import { Router } from 'express';
import { postMessages, getMessages, getMessagesByInteractionId } from '../controllers/pixController';

const router = Router();

router.post('/msgs/:ispb/:number', postMessages);

router.get('/:ispb/stream/start', getMessages);

router.get('/:ispb/stream/:interaction_id', getMessagesByInteractionId);

export default router;
