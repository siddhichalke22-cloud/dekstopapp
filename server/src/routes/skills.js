import { Router } from 'express';
import { createSkillExchange, listSkillExchanges, listSkills } from '../controllers/skillsController.js';

const router = Router();

router.get('/', listSkills);
router.get('/exchanges', listSkillExchanges);
router.post('/exchanges', createSkillExchange);

export default router;