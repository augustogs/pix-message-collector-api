import { Router } from 'express';
import { postMessages } from '../controllers/pixController';

const router = Router();

router.post('/msgs/:ispb/:number', postMessages);

export default router;
