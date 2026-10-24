import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = Router();

router.get('/', getProfile);
router.patch('/:id', updateProfile);

export default router;
