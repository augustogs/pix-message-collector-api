import { Router } from 'express';
import { postMessages, getMessages } from '../controllers/pixController';

const router = Router();

router.post('/msgs/:ispb/:number', postMessages);

router.get('/:ispb/stream/start', getMessages);

export default router;
