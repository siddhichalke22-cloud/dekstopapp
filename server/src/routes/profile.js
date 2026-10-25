import { Router } from 'express';
import { getMyProfile, getProfile, listStudents, updateMySkills, updateProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', getProfile);
router.get('/students', listStudents);
router.get('/me', requireAuth, getMyProfile);
router.put('/me/skills', requireAuth, updateMySkills);
router.patch('/me', requireAuth, updateProfile);
router.patch('/:id', updateProfile);

export default router;
